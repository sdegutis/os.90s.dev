import api, { $ } from '/os/api.js'
import { ColorView } from '/os/fs/sys/libs/colorpicker.js'
await api.preludesFinished

const $color = $(0x00000000)

const file = {
  $path: $(api.program.opts["file"] ?? 'usr/mysprite.jsln'),
  getContents() {
    return ''
  }
}

const panel = await api.sys.makePanel({ name: "sprite maker" },
  <panel size={{ w: 220, h: 150 }} file={file}>
    <ColorView $color={$color} />
  </panel>
)

panel.focusPanel()
