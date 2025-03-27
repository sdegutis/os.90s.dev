import { Panel } from "/client/core/panel.js"
import { $ } from "/client/core/ref.js"
import { program, sys } from "/client/core/sys.js"
import { FilePanelView } from "/client/util/panelview.js"
import type { Textarea } from "/client/views/textarea.js"

const $content = $('')
const $filepath = $(program.opts["file"])
if ($filepath.val) $content.val = await sys.getfile($filepath.val) ?? ''

const textarea = <textarea text={$content.val} autofocus /> as Textarea

const panel = await Panel.create(
  <FilePanelView filedata={$content} filepath={$filepath} title={$('writer')} size={$({ w: 100, h: 70 })}>
    <scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      <border canMouse padding={2} onMouseDown={function (b) { this.firstChild!.onMouseDown?.(b) }}>
        {textarea}
      </border>
    </scroll>
  </FilePanelView>
)

panel.focusPanel()
