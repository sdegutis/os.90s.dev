import { fs } from "../fs/fs.js"
import { Font } from "./font.js"
import { JSLN } from "./jsln.js"

async function loadConfigs<T extends Record<string, any>>(
  kvs: { [K in keyof T]: (o: any) => Promise<T[K] | undefined> }
) {
  const paths = [
    'usr/config.jsln',
    'sys/default/config.jsln',
  ]

  const files = await Promise.all(paths.map(p => fs.getFile(p)))
  const configs = files.map(f => JSLN.tryParse(f!)).filter(c => c !== undefined)

  const o = {} as T

  nextKey:
  for (const [keyPath, validate] of Object.entries(kvs)) {
    const keys = keyPath.split('.')
    const last = keys.pop()!
    nextConfig:
    for (const config of configs) {
      try {
        let node = config
        for (const key of keys) node = node[key]
        const userval = node[last] as T[string]
        const compval = await validate(userval)
        if (compval === undefined) continue nextConfig
        (o as any)[keyPath] = compval
        continue nextKey
      }
      catch (e) { }
    }
  }

  return o
}

export const getConfigs = () => loadConfigs({
  'sys.size': async ([w, h]: [number, number]) => {
    return w > 0 && h > 0 ? [w, h] : undefined
  },
  'sys.font': async (path: string) => {
    const content = await fs.getFile(path)
    return content ? new Font(content) : undefined
  },
  'sys.shell': async (path: string) => {
    return await fs.getFile(path) ? path : undefined
  },
  'sys.startup': async (paths: string[]) => {
    if (!(paths instanceof Array)) return undefined
    if (!paths.every(p => typeof p === 'string')) return undefined
    return paths
  },
})
