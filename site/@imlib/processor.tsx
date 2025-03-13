import { jsxToString, processFile, type SiteProcessor } from "@imlib/core"

const $ = jsxToString

const copyright = `Copyright ©️ ${new Date().getFullYear()} Novo Cantico LLC. All rights reserved.`

const icon = $(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 5">
  <path d="M1 0 L3 2 1 4 Z" fill="#19f" />
</svg>)

const ext = (s: string) => s.match(/\.([^\/]+)$/)?.[1] ?? ''

export default (({ inFiles, outFiles }) => {
  const files = [...inFiles].filter(f => !f.path.startsWith('/@imlib/'))
  const paths = files.map(f => f.path).filter(s => !s.endsWith('.d.js'))

  const datas = (paths
    .filter(s => !['js', 'html'].includes(ext(s)))
    .map(s => <link rel="preload" as="fetch" href={s.replace(/\.js$/, '')} crossorigin="anonymous" />))

  const modules = (paths
    .filter(s => ext(s) === 'js')
    .map(s => <link rel="modulepreload" href={s} />))

  const iconlink = <link rel="shortcut icon" href={`data:image/svg+xml,${encodeURIComponent(icon)}`} />
  const headers = [...datas, ...modules, iconlink]
  const toinsert = headers.map(s => `  ${$(s)}`).join('\n')

  function insert(s: string) {
    return s.replace('<head>', `<head>\n${toinsert}`)
  }

  for (const file of files) {
    for (let { path, content } of processFile(file)) {
      if (path.endsWith('.js')) content = `/** ${copyright} */\n` + content.toString('utf8')
      if (path.endsWith('.html')) content = `<!-- ${copyright} -->\n` + insert(content.toString('utf8'))
      outFiles.set(path, content)
    }
  }
}) as SiteProcessor
