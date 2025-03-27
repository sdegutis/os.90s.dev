import { Panel } from "/client/core/panel.js"
import { $ } from "/client/core/ref.js"
import { program, sys } from "/client/core/sys.js"
import { PanelView } from "/client/util/panelview.js"
import type { Textarea } from "/client/views/textarea.js"

const $content = $('')

let filepath = program.opts["file"]
if (filepath) $content.val = await sys.getfile(filepath) ?? ''

const textarea = <textarea text={$content.val} autofocus /> as Textarea

const panel = await Panel.create(
  <PanelView title={'Writer'} size={$({ w: 100, h: 70 })}>
    <scroll onKeyDown={handleKey} background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      <border canMouse padding={2} onMouseDown={function (b) { this.firstChild!.onMouseDown?.(b) }}>
        {textarea}
      </border>
    </scroll>
  </PanelView>
)

panel.focusPanel()

function handleKey(key: string) {
  if (key === 's' && panel.isKeyDown('Control')) {
    sys.putfile(filepath, textarea.text)
    return true
  }
  return false
}
