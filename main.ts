import { transformSync } from '@swc/core'
import { randomUUID } from 'crypto'
import * as fs from 'fs'
import * as immaculata from 'immaculata'

const isDev = process.argv[2] === 'dev'

let swc1 = fs.readFileSync('node_modules/@swc/wasm-web/wasm.js').toString()
let swc2 = fs.readFileSync('node_modules/@swc/wasm-web/wasm_bg.wasm')

swc1 = swc1.replace(/\nexport function/g, 'function')
swc1 = swc1.replace(/\nexport {[\s\S]+/, '')
swc1 = swc1.replace('import.meta.url', `location.origin + '/sys/sw/'`)

const tree = new immaculata.LiveTree('site', import.meta.url)

const copyright = `Copyright ©️ ${new Date().getFullYear()} Novo Cantico LLC. All rights reserved.`

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 5"><path d="M1 0 L3 2 1 4 Z" fill="#19f" /></svg>`
const iconlink = `<link rel="shortcut icon" href="${`data:image/svg+xml,${encodeURIComponent(icon)}`}" />`

const config = {
  net: 'https://net.90s.dev',
}

function processSite() {
  return tree.processFiles(files => {

    files.with('^/fs/api\.ts$').remove()

    files.add('/sys/sw/wasm.js', swc1)
    files.add('/sys/sw/wasm_bg.wasm', swc2)

    const dbfile = files.with('^/sys/api/util/db.ts$').all()[0]
    files.add('/sys/sw/db.ts', dbfile.text.replace('export ', ''))

    const configfile = files.with('^/sys/api/config.ts$').all()[0]
    files.add('/sys/sw/config.ts', configfile.text.replace('export ', ''))

    files.with('/out/').remove()
    files.with('tsconfig\.json').remove()
    files.with(/\.d\.ts$/).remove()

    if (!isDev) files.add('/sys/api/config.ts', `export const config = ${JSON.stringify(config)}`)

    files.with(/\.js$/).do(file => { file.text = `// ${copyright}\n\n` + file.text })
    files.with(/\.tsx?$/).do(file => { file.text = `// ${copyright}\n\n` + file.text })
    files.with(/\.html$/).do(file => { file.text = `<!-- ${copyright} -->\n\n` + file.text })

    files.with(/\.tsx?$/).without('^/fs/sys/').do(file => {
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
      file.text = file.text.replace(`${placeholder}/jsx-runtime`, '/sys/api/jsx.js')
    })

    files.with(/\.tsx?$/).do(file => { file.path = file.path.replace(/\.tsx?$/, '.js') })

    const apis = files.with('^/sys/api/').paths()
    fs.writeFileSync('./site/fs/api.ts', apis.map(p => `export * from "..${p}"`).join('\n'))
    files.add('/api.js', apis.map(p => `export * from "${p}"`).join('\n'))

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

    const toinsert = [...datas, ...modules, iconlink].map(s => `  ${s}`).join('\n')
    files.with(/\.html$/).do(file => file.text = file.text.replace('<head>', `<head>\n${toinsert}`))

  })
}

if (isDev) {
  const server = new immaculata.DevServer(8080, '/_reload')
  server.files = await processSite()
  server.notFound = () => '/404.html'

  tree.watch({
    ignored: (str) => str.includes('/out/') || str.endsWith('/site/fs/api.ts')
  }, async (paths) => {
    const start = Date.now()
    try { server.files = await processSite() }
    catch (e) { console.error(e) }
    console.log('Reprocessed:', Date.now() - start + 'ms')
    server.reload()
  })
}
else {
  immaculata.generateFiles(await processSite())
}
