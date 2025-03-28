import * as babelparser from '@babel/parser'
import _babeltraverser from '@babel/traverse'
import * as swc from '@swc/core'
import fs from 'fs'
import { processFile } from "immaculata"

/** @type {typeof _babeltraverser} */
const babeltraverser = _babeltraverser.default

function getexports(src) {
  const node = babelparser.parse(src, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })

  const vars = []
  const types = []

  function addtype(d) {
    if (d.id.name === 'wRPC') return
    types.push({
      name: d.id.name,
      params: d.typeParameters?.params.map(p => p.name)
    })
  }

  babeltraverser(node, {
    ExportNamedDeclaration: {
      enter: (path) => {
        const d = path.node.declaration
        if (path.node.exportKind === 'type') {
          addtype(d)
          return
        }

        if (d.type === 'VariableDeclaration') {
          vars.push(...d.declarations.map(d => d.id.name))
        }
        else if (d.type === 'ClassDeclaration') {
          vars.push(d.id.name)
          addtype(d)
        }
        else if (d.type === 'FunctionDeclaration') {
          vars.push(d.id.name)
        }
      },
    }
  })

  return { vars, types }
}

const swc1 = fs.readFileSync('node_modules/@swc/wasm-web/wasm.js')
const swc2 = fs.readFileSync('node_modules/@swc/wasm-web/wasm_bg.wasm')

const copyright = `Copyright ©️ ${new Date().getFullYear()} Novo Cantico LLC. All rights reserved.`

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 5">
  <path d="M1 0 L3 2 1 4 Z" fill="#19f" />
</svg>`

const ext = (s) => s.match(/\.([^\/]+)$/)?.[1] ?? ''

export const jsxPathBrowser = '/client/jsx.ts'

export default (({ inFiles, outFiles }) => {
  let files = [...inFiles]

  files = files.filter(f => !f.path.endsWith('.tsbuildinfo') && !f.path.endsWith('tsconfig.json'))

  files.push({ path: '/swc/wasm.js', content: swc1 })
  files.push({ path: '/swc/wasm_bg.wasm', content: swc2 })

  const exports = (files
    .filter(f => f.path.startsWith('/client/'))
    .map(f => {
      const ids = getexports(f.module.source)
      return { path: f.path, ids }
    }))

  fs.writeFileSync('./globals.d.ts', [
    `export{}`,
    `declare global {`,
    exports.flatMap(exp => {
      const vars = exp.ids.vars.map(id => {
        return [`var ${id}: typeof import("./site${exp.path}").${id}`]
      })
      const types = exp.ids.types.map(type => {
        let params = ''
        if (type.params) params = `<${type.params.join(', ')}>`
        return [`type ${type.name}${params} = import("./site${exp.path}").${type.name}${params}`]
      })
      return [
        ...vars,
        ...types,
      ]
    }).join('\n'),
    `}`,
  ].join('\n'))

  const clientfiles = (exports
    .map(exp => `import { ${exp.ids.vars.join(', ')} } from "${exp.path}"`)
    .join('\n'))

  files.push({ path: '/prelude.js', content: clientfiles })

  const sysdata = JSON.stringify(Object.fromEntries(files
    .filter(f => f.path.startsWith('/fs/sys'))
    .map(f => [f.path.slice('/fs/sys/'.length), (f.module?.source ?? f.content).toString()])
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

  function insert(s) {
    return s.replace('<head>', `<head>\n${toinsert}`)
  }

  for (const file of files) {
    if (file.path.startsWith('/fs/sys/')) {
      outFiles.set(file.path, (file.module?.source ?? file.content).toString())
      continue
    }

    for (let { path, content } of processFile(file)) {
      if (path.endsWith('.js')) content = minify(`/** ${copyright} */\n` + content.toString())
      if (path.endsWith('.html')) content = `<!-- ${copyright} -->\n` + insert(content.toString())
      outFiles.set(path, content)
    }
  }
})

function minify(js) {
  return js
  // if (!process.env.GITHUB_ENV) return js
  // return swc.minifySync(js, { module: true }).code
}
