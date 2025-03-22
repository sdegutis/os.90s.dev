import { Program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"
import type { view } from "../client/views/view.js"

const prog = new Program()
await prog.init()

const size = $({ w: 100, h: 100 })

const textarea = <textarea background={0x99000099} />

const panel = await prog.makePanel({
  size,
  view: <PanelView size={size} title={'test panel'}>
    <view background={0xffffff11} adjust={expand}>
      {textarea}
    </view>
  </PanelView>,
})

textarea.focus()
panel.focus()

function expand(this: view) {
  console.log('called', this.parent)
  if (!this.parent) return
  this.size = this.parent.size
}
