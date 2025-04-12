import { fs } from "../fs/fs.js"
import { Font } from "./font.js"
import { JSLN } from "./jsln.js"
import { $ } from "./ref.js"

const baseConfigData = await loadConfig('sys/default/config.jsln') as any
const baseConfig = {
  size: ({
    w: baseConfigData.sys.size[0] as number,
    h: baseConfigData.sys.size[1] as number,
  }),
  font: new Font((await fs.getFile(baseConfigData.sys.font))!),
  shell: baseConfigData.sys.shell as string,
  bgcolor: baseConfigData.sys.bgcolor as number,
  startup: baseConfigData.sys.startup as string[] | undefined,
}

export const sysConfig = {
  $size: $(baseConfig.size),
  $font: $(baseConfig.font),
  $shell: $(baseConfig.shell),
  $bgcolor: $(baseConfig.bgcolor),
  startup: baseConfig.startup,
}

await loadUsrConfig()
fs.watchTree('usr/config.jsln', loadUsrConfig)

async function loadUsrConfig() {
  const usrConfig = await loadConfig('usr/config.jsln') as any

  const w = as(usrConfig?.sys?.size?.[0], 'number') ?? 0
  const h = as(usrConfig?.sys?.size?.[1], 'number') ?? 0
  sysConfig.$size.val = (w > 0 && h > 0) ? { w, h } : baseConfig.size

  const fontpath = as(usrConfig?.sys?.font, 'string')
  if (fontpath) {
    const fontsrc = await fs.getFile(fontpath)
    sysConfig.$font.val = fontsrc
      ? new Font(fontsrc)
      : baseConfig.font
  }

  const shell = as(usrConfig?.sys?.shell, 'string')
  sysConfig.$shell.val = shell || baseConfig.shell

  const bgcolor = as(usrConfig?.sys?.bgcolor, 'number')
  sysConfig.$bgcolor.val = (bgcolor !== undefined)
    ? bgcolor
    : baseConfig.bgcolor
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
