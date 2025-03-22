import { Program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"

const prog = new Program()
await prog.init()

const size = $({ w: 100, h: 100 })

const textarea = <textarea background={0x99000099} />

const panel = await prog.makePanel({
  size,
  view: <PanelView size={size} title={'test panel'}>
    <scroll background={0xffffff11}
      onMouseDown={function (...args) { this.content.onMouseDown?.(...args) }}>
      {textarea}
    </scroll>
  </PanelView>,
})

textarea.focus()
panel.focus()
