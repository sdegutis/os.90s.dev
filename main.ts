import * as fs from 'fs'
import * as immaculata from 'immaculata'

const swc1 = fs.readFileSync('node_modules/@swc/wasm-web/wasm.js')
const swc2 = fs.readFileSync('node_modules/@swc/wasm-web/wasm_bg.wasm')

const tree = new immaculata.LiveTree('site', import.meta.url)

const compile = immaculata.makeSwcTransformJsx(() => '/client/jsx.js')

const ext = (s: string) => s.match(/\.([^\/]+)$/)?.[1] ?? ''

const copyright = `Copyright ©️ ${new Date().getFullYear()} Novo Cantico LLC. All rights reserved.`

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 5">
  <path d="M1 0 L3 2 1 4 Z" fill="#19f" />
</svg>`

function processSite() {
  return tree.processFiles(files => {

    files = files.filter(f => !f.path.endsWith('.d.ts'))

    files = files.map(file => {
      if (!file.path.match(/\.tsx?$/)) return file

      const path = file.path.replace(/\.tsx?$/, '.js')

      let content = file.content.toString()
      content = `// ${copyright}\n\n` + content

      if (file.path.startsWith('/fs/sys/')) {
        return { content, path }
      }

      content = compile('', file.path, content.toString(), true)
      return { content, path }
    })

    files.push({ path: '/sw/wasm.js', content: swc1 })
    files.push({ path: '/sw/wasm_bg.wasm', content: swc2 })

    const exports = files
      .filter(f => f.path.startsWith('/client/'))
      .map(f => `export * from ".${f.path}"`)
      .join('\n')

    fs.writeFileSync('./site/api.d.ts', exports)
    files.push({ path: '/api.js', content: exports })

    const sysdata = JSON.stringify(Object.fromEntries(files
      .filter(f => f.path.startsWith('/fs/sys'))
      .map(f => [f.path.slice('/fs/sys/'.length), f.content.toString()])
    ), null, 2)
    files.push({ path: '/server/fs/data.js', content: `export const files = ${sysdata}` })

    const paths = files.map(f => f.path).filter(s => !s.startsWith('/fs/sys'))

    const datas = (paths
      .filter(s => !['js', 'html', 'wasm'].includes(ext(s)))
      .map(s => `<link rel="preload" as="fetch" href="${s.replace(/\.js$/, '')}" crossorigin="anonymous" />`))

    const modules = (paths
      .filter(s => ext(s) === 'js')
      .map(s => `<link rel="modulepreload" href="${s}" />`))

    const iconlink = `<link rel="shortcut icon" href="${`data:image/svg+xml,${encodeURIComponent(icon)}`}" />`
    let hmr = ``
    // hmr = `<script>new EventSource('/@imlib/hmr').onmessage = () => location.reload()</script>`
    const headers = [...datas, ...modules, iconlink, hmr]
    const toinsert = headers.map(s => `  ${s}`).join('\n')

    function insert(s: string) {
      return s.replace('<head>', `<head>\n${toinsert}`)
    }

    files = files.map(file => {
      if (file.path.endsWith('.html')) {
        return {
          path: file.path,
          content: `<!-- ${copyright} -->\n\n` + insert(file.content.toString()),
        }
      }
      return file
    })

    return files
  })
}

if (process.argv[2] === 'dev') {
  const server = new immaculata.DevServer(8080)
  server.files = processSite()

  tree.watch({
    ignored: (str) => str.endsWith('/site/api.d.ts')
  }, (paths) => {
    console.log('paths changed')
    server.files = processSite()
    server.reload()
  })
}
else {
  immaculata.generateFiles(processSite())
}
