import * as swc from '@swc/core'
import fs from 'fs'
import { processFile } from "immaculata"

const swc1 = fs.readFileSync('node_modules/@swc/wasm-web/wasm.js')
const swc2 = fs.readFileSync('node_modules/@swc/wasm-web/wasm_bg.wasm')

const copyright = `Copyright ©️ ${new Date().getFullYear()} Novo Cantico LLC. All rights reserved.`

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 5">
  <path d="M1 0 L3 2 1 4 Z" fill="#19f" />
</svg>`

const ext = (s) => s.match(/\.([^\/]+)$/)?.[1] ?? ''

export const jsxPathBrowser = '/jsx.ts'

export default (({ inFiles, outFiles }) => {
  const files = [...inFiles]

  files.push({ path: '/swc/wasm.js', content: swc1 })
  files.push({ path: '/swc/wasm_bg.wasm', content: swc2 })

  const sysdata = JSON.stringify(Object.fromEntries(files
    .filter(f => f.path.startsWith('/server/data'))
    .map(f => [f.path.slice('/server/data/'.length), f.content.toString()])
  ), null, 2)
  files.push({ path: '/server/fs/data.js', content: `export const files = ${sysdata}` })

  const paths = files.map(f => f.path).filter(s => !s.startsWith('/server/data'))

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

  function insert(s) {
    return s.replace('<head>', `<head>\n${toinsert}`)
  }

  for (const file of files) {
    for (let { path, content } of processFile(file)) {
      if (path.endsWith('.js')) content = minify(`/** ${copyright} */\n` + content.toString())
      if (path.endsWith('.html')) content = `<!-- ${copyright} -->\n` + insert(content.toString())
      outFiles.set(path, content)
    }
  }
})

function minify(js) {
  if (!process.env.GITHUB_ENV) return js
  return swc.minifySync(js, { module: true }).code
}
