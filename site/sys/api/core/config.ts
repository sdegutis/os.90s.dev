import { fs } from "../fs/fs.js"
import { Font } from "./font.js"
import { JSLN } from "./jsln.js"
import { $ } from "./ref.js"
import { as } from "./typesafe.js"

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
  prelude: baseConfigData.sys.prelude as string[] | undefined,
}

export const sysConfig = {
  $size: $(baseConfig.size),
  $font: $(baseConfig.font),
  $shell: $(baseConfig.shell),
  $bgcolor: $(baseConfig.bgcolor),
  startup: baseConfig.startup,
  prelude: baseConfig.prelude,
}

await loadUsrConfig()
fs.watchTree('usr/config.jsln', loadUsrConfig)

async function loadUsrConfig() {
  const usrConfig = await loadConfig('usr/config.jsln') as any

  const dims = as(usrConfig, 'sys.size[0]', 'numbers')
  const w = dims?.[0]
  const h = dims?.[1]
  sysConfig.$size.val = (w && h) ? { w, h } : baseConfig.size

  const fontpath = as(usrConfig, 'sys.font', 'string')
  if (fontpath) {
    const fontsrc = await fs.getFile(fontpath)
    sysConfig.$font.val = fontsrc
      ? new Font(fontsrc)
      : baseConfig.font
  }

  const shell = as(usrConfig, 'sys.shell', 'string')
  sysConfig.$shell.val = shell || baseConfig.shell

  const prelude = as(usrConfig, 'sys.prelude', 'strings')
  sysConfig.prelude = prelude || baseConfig.prelude

  const bgcolor = as(usrConfig, 'sys.bgcolor', 'number')
  sysConfig.$bgcolor.val = (bgcolor !== undefined)
    ? bgcolor
    : baseConfig.bgcolor
}

async function loadConfig(path: string) {
  const content = await fs.getFile(path)
  if (!content) return undefined
  return JSLN.tryParse(content)
}
