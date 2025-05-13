import { transformSync } from '@swc/core'
import Zip from 'adm-zip'
import { randomUUID } from 'crypto'
import * as fs from 'fs'
import * as immaculata from 'immaculata'

const isDev = process.argv[2] === 'dev'

let swc1 = fs.readFileSync('node_modules/@swc/wasm-web/wasm.js').toString()
let swc2 = fs.readFileSync('node_modules/@swc/wasm-web/wasm_bg.wasm')

swc1 = swc1.replace(/\nexport function/g, 'function')
swc1 = swc1.replace(/\nexport {[\s\S]+/, '')
swc1 = swc1.replace('import.meta.url', `location.origin + '/os/sys/sw/'`)

const tree = new immaculata.FileTree('site', import.meta.url, {
  exclude: (path, stat) =>
    path === '/fs/api.ts' ||
    path.endsWith('.tsbuildinfo')
})

const copyright = `Copyright ©️ ${new Date().getFullYear()}. You're welcome and encouraged to use and learn from all the code here.`

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 5"><path d="M1 0 L3 2 1 4 Z" fill="#19f" /></svg>`
const iconlink = `<link rel="shortcut icon" href="${`data:image/svg+xml,${encodeURIComponent(icon)}`}" />`

function processSite() {
  const files = immaculata.Pipeline.from(tree.files)

  files.with('^/sample/').remove()

  const apidts = files.with('^/sys/out/api/.+\.d\.ts$').copy()

  files.with('^/fs/api\.ts$').remove()

  files.with(/\.tsx?$/).do(f => f.text = f.text.replace(/\r/g, ''))

  files.add('/sys/sw/wasm.js', swc1)
  files.add('/sys/sw/wasm_bg.wasm', swc2)

  const dbfile = files.with('^/sys/api/util/db.ts$').all()[0]
  files.add('/sys/sw/db.ts', dbfile.text.replace('export ', ''))

  files.with('/out/').remove()
  files.with('tsconfig\.json').remove()
  files.with(/\.d\.ts$/).remove()

  files.with(/\.js$/).do(file => { file.text = `// ${copyright}\n\n` + file.text })
  files.with(/\.tsx?$/).do(file => { file.text = `// ${copyright}\n\n` + file.text })
  files.with(/\.html$/).do(file => { file.text = `<!-- ${copyright} -->\n\n` + file.text })

  const src = files.with('^/sys/api/').copy()

  files.with(/\.tsx?$/).without('^/fs/sys/').do(compileTsx)

  files.with(/\.tsx?$/).do(file => { file.path = file.path.replace(/\.tsx?$/, '.js') })

  const defaultExport = "\nexport * as default from './api.js'"

  const apis = files.with('^/sys/api/').paths()
  fs.writeFileSync('./site/fs/api.ts', apis.map(p => `export * from "..${p}"`).join('\n') + defaultExport)
  files.add('/api.js', apis.map(p => `export * from "/os${p}"`).join('\n') + defaultExport)

  src.do(f => { files.add('/fs/sys/api' + f.path.slice('/sys/api'.length).replace(/\.tsx?$/, '.js'), f.text) })

  const sysdata = JSON.stringify((files
    .with('^/fs/sys')
    .all().map(f => ({
      path: f.path.slice('/fs/sys/'.length),
      content: f.text,
    }))
  ), null, 2)
  files.add('/sys/api/fs/data.js', `export const files = ${sysdata}`)

  const paths = files.without('^/fs/sys')

  const datas = paths.without('\.js$|\.html$|\.wasm$').paths()
    .map(path => `<link rel="preload" as="fetch" href="${path}" crossorigin="anonymous" />`)

  const modules = paths.with('\.js$').without('^/sys/sw/').paths()
    .map(path => `<link rel="modulepreload" href="${path}" />`)

  const toinsert = [...datas, /* ...modules, */ iconlink].map(s => `  ${s}`).join('\n')
  files.with(/\.html$/).do(file => file.text = file.text.replace('<head>', `<head>\n${toinsert}`))

  const apidts2 = Object.fromEntries(apidts.all().map(f => [f.path.replace(/^\/sys\/out\//, '/os/sys/'), f.text]))
  apidts2['/os/api.d.ts'] = apis.map(p => `export * from "/os${p}"`).join('\n') + defaultExport
  const apiexports = JSON.stringify(apidts2)

  files.add('/api.d.ts.json', apiexports)

  const zip = new Zip()
  zip.addLocalFolder('node_modules/@types/wicg-file-system-access', 'node_modules/@types/wicg-file-system-access')
  zip.addLocalFolder('site/sys/api/', 'sys/api/')
  zip.addLocalFile('site/sys/tsconfig.json', 'sys/')
  zip.addLocalFolder('site/sample/', 'app/')
  zip.addLocalFolder('./site/fs/', 'fs', path => !path.match(/fs(\\|\/)out(\\|\/)/))
  zip.addFile('.vscode/settings.json', Buffer.from(JSON.stringify({
    "typescript.preferences.importModuleSpecifierEnding": "js",
    "typescript.preferences.importModuleSpecifier": "non-relative",
  }, null, 2)))
  files.add('/helloworld.zip', zip.toBuffer())

  files.do(f => f.path = '/os' + f.path)

  return files.results()
}

if (isDev) {
  const server = new immaculata.DevServer(8080, { hmrPath: '/_reload' })
  server.files = processSite()
  server.notFound = () => '/404.html'

  tree.watch().on('filesUpdated', async () => {
    const start = Date.now()
    try { server.files = processSite() }
    catch (e) { console.error(e) }
    console.log('Reprocessed:', Date.now() - start + 'ms')
    server.reload()
  })
}
else {
  immaculata.generateFiles(processSite())
}

function compileTsx(file: { text: string, path: string }) {
  const placeholder = randomUUID()
  file.text = transformSync(file.text, {
    filename: file.path,
    sourceMaps: 'inline',
    minify: true,
    isModule: true,
    module: {
      type: 'es6',
    },
    jsc: {
      keepClassNames: true,
      target: 'esnext',
      parser: {
        syntax: 'typescript',
        tsx: true,
        decorators: true,
      },
      transform: {
        react: {
          runtime: 'automatic',
          importSource: placeholder,
        }
      }
    }
  }).code
  file.text = file.text.replace(`${placeholder}/jsx-runtime`, '/os/sys/api/core/jsx.js')
}
