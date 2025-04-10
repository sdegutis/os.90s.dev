import { fs } from "../fs/fs.js"
import { JSLN } from "./jsln.js"

async function loadConfigs<T extends Record<string, any>>(
  kvs: { [K in keyof T]: (o: T[K]) => Promise<boolean> }
) {
  const paths = [
    'usr/config.jsln',
    'sys/default/config.jsln',
  ]

  const files = await Promise.all(paths.map(p => fs.getFile(p)))
  const configs = files.map(f => JSLN.tryParse(f!)).filter(c => c !== null)

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
        const val = node[last] as T[string]
        const valid = await validate(val)
        if (!valid) continue nextConfig
        (o as any)[keyPath] = val
        continue nextKey
      }
      catch (e) {
        console.error(e)
      }
    }
    throw new Error(`Sys config file invalid?`)
  }

  return o
}

export const getConfigs = () => loadConfigs({
  'sys.size': async ([w, h]: [number, number]) => w > 0 && h > 0,
  'sys.font': async (path: string) => !!(await fs.getFile(path)),
})
