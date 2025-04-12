import { fs } from "../fs/fs.js"
import { Font } from "./font.js"
import { JSLN } from "./jsln.js"
import { $ } from "./ref.js"

const baseConfig = await loadConfig('sys/default/config.jsln') as any

export const sysConfig = {
  $size: $({
    w: baseConfig.sys.size[0] as number,
    h: baseConfig.sys.size[1] as number,
  }),
  $font: $(new Font((await fs.getFile(baseConfig.sys.font))!)),
  $shell: $(baseConfig.sys.shell as string),
  startup: baseConfig.sys.startup as string[] | undefined,
}

await loadUsrConfig()
fs.watchTree('usr/config.jsln', loadUsrConfig)

async function loadUsrConfig() {
  const usrConfig = await loadConfig('usr/config.jsln') as any

  const w = as(usrConfig?.sys?.size?.[0], 'number') ?? 0
  const h = as(usrConfig?.sys?.size?.[1], 'number') ?? 0
  if (w > 0 && h > 0) sysConfig.$size.val = { w, h }

  const fontpath = as(usrConfig?.sys?.font, 'string')
  if (fontpath) {
    const fontsrc = await fs.getFile(fontpath)
    if (fontsrc) sysConfig.$font.val = new Font(fontsrc)
  }

  const shell = as(usrConfig?.sys?.shell, 'string')
  if (shell) sysConfig.$shell.val = shell
}

// clever idea by Alexander Nenashev
type Primitive = { string: string, number: number, boolean: boolean }
function as<T extends keyof Primitive>(o: any, as: T) {
  return (typeof o === as) ? o as Primitive[T] : undefined
}

async function loadConfig(path: string) {
  const content = await fs.getFile(path)
  if (!content) return undefined
  return JSLN.tryParse(content)
}
