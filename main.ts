import * as fs from 'fs'
import * as immaculata from 'immaculata'

const swc1 = fs.readFileSync('node_modules/@swc/wasm-web/wasm.js')
const swc2 = fs.readFileSync('node_modules/@swc/wasm-web/wasm_bg.wasm')

const tree = new immaculata.LiveTree('site', import.meta.url)

const copyright = `Copyright ©️ ${new Date().getFullYear()} Novo Cantico LLC. All rights reserved.`

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 5"><path d="M1 0 L3 2 1 4 Z" fill="#19f" /></svg>`
const iconlink = `<link rel="shortcut icon" href="${`data:image/svg+xml,${encodeURIComponent(icon)}`}" />`

function processSite() {
  return tree.processFiles(files => {

    files.with(/\.d\.ts$/).remove()

    files.with(/\.tsx?$/).without('^/fs/sys/').do(file => {
      file.text = immaculata.compileWithSwc(file.text, opts => {
        opts.filename = file.path
        opts.jsc ??= {}
        opts.jsc.transform ??= {}
        opts.jsc.transform.react ??= {}
        opts.jsc.transform.react.importSource = '/client/jsx.js'
      }).code
    })

    files.with(/\.tsx?$/).do(file => { file.path = file.path.replace(/\.tsx?$/, '.js') })

    files.with(/\.js$/).do(file => { file.text = `// ${copyright}\n\n` + file.text })
    files.with(/\.html$/).do(file => { file.text = `<!-- ${copyright} -->\n\n` + file.text })

    files.add('/sw/wasm.js', swc1)
    files.add('/sw/wasm_bg.wasm', swc2)

    const exports = files.with('^/client/').all().map(f => `export * from ".${f.path}"`).join('\n')
    fs.writeFileSync('./site/api.d.ts', exports)
    files.add('/api.js', exports)

    const sysdata = JSON.stringify(Object.fromEntries(files
      .with('^/fs/sys')
      .all().map(f => [f.path.slice('/fs/sys/'.length), f.text])
    ), null, 2)
    files.add('/client/fs/data.js', `export const files = ${sysdata}`)

    const paths = files.without('^/fs/sys')

    const datas = paths.without('\.js$|\.html$|\.wasm$').paths()
      .map(path => `<link rel="preload" as="fetch" href="${path}" crossorigin="anonymous" />`)

    const modules = paths.with('\.js$').paths()
      .map(path => `<link rel="modulepreload" href="${path}" />`)

    const toinsert = [...datas, ...modules, iconlink].map(s => `  ${s}`).join('\n')
    files.with(/\.html$/).do(file => file.text = file.text.replace('<head>', `<head>\n${toinsert}`))

  })
}

if (process.argv[2] === 'dev') {
  const server = new immaculata.DevServer(8080, '/_reload')
  server.files = await processSite()

  tree.watch({
    ignored: (str) => str.endsWith('/site/api.d.ts')
  }, async (paths) => {
    console.log('Reloaded.')
    try { server.files = await processSite() }
    catch (e) { console.error(e) }
    server.reload()
  })
}
else {
  immaculata.generateFiles(await processSite())
}
