import { processFile, type SiteProcessor } from "immaculata"

const copyright = `Copyright ©️ ${new Date().getFullYear()} Novo Cantico LLC. All rights reserved.`

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 5">
  <path d="M1 0 L3 2 1 4 Z" fill="#19f" />
</svg>`

const ext = (s: string) => s.match(/\.([^\/]+)$/)?.[1] ?? ''

export default (({ inFiles, outFiles }) => {
  const files = [...inFiles].filter(f => !['/@imlib/processor.js'].includes(f.path))
  const paths = files.map(f => f.path).filter(s => !s.endsWith('.d.js'))

  const datas = (paths
    .filter(s => !['js', 'html'].includes(ext(s)))
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

  for (const file of files) {
    for (let { path, content } of processFile(file)) {
      if (path.endsWith('.js')) content = `/** ${copyright} */\n` + tostring(content)
      if (path.endsWith('.html')) content = `<!-- ${copyright} -->\n` + insert(tostring(content))
      outFiles.set(path, content)
    }
  }
}) as SiteProcessor

const dec = new TextDecoder()

function tostring(str: string | Uint8Array) {
  return typeof str === 'string' ? str : dec.decode(str)
}
