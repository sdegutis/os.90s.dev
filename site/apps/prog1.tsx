import { Program } from "../client/core/prog.js"
import { vacuumFirstChild } from "../client/util/layout.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"

const prog = new Program()
await prog.init()

const size = $({ w: 100, h: 100 })

const textarea = <textarea />

const panel = await prog.makePanel({
  size,
  view: <PanelView size={size} title={'test panel'}>
    <view background={0xffffff11} layout={vacuumFirstChild}>
      {textarea}
    </view>
  </PanelView>,
})

textarea.focus()
panel.focus()
