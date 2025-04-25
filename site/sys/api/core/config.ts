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
}

export const sysConfig = {
  $size: $(baseConfig.size),
  $font: $(baseConfig.font),
  $shell: $(baseConfig.shell),
}

export const $usrConfig = $<Record<string, any> | undefined>(undefined)

async function _load() {
  $usrConfig.$ = await loadConfig('usr/config.jsln')
}

$usrConfig.watch(async (usrConfig) => {

  const dims = as(usrConfig, 'sys.size', as.numbers(2))
  const w = dims?.[0]
  const h = dims?.[1]
  sysConfig.$size.$ = (w && h) ? { w, h } : baseConfig.size

  const fontpath = as(usrConfig, 'sys.font', as.string)
  if (fontpath) {
    const fontsrc = await fs.getFile(fontpath)
    sysConfig.$font.$ = fontsrc
      ? new Font(fontsrc)
      : baseConfig.font
  }

  const shell = as(usrConfig, 'sys.shell', as.string)
  sysConfig.$shell.$ = shell || baseConfig.shell

})

await _load()
fs.watchTree('usr/config.jsln', _load)

async function loadConfig(path: string) {
  const content = await fs.getFile(path)
  if (!content) return undefined
  return JSLN.tryParse(content)
}
