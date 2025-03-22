import { Program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"

const prog = new Program()
await prog.init()

const size = $({ w: 100, h: 100 })

const textarea = <textarea background={0xffffff11} />

const panel = await prog.makePanel({
  size,
  view: <PanelView size={size} title={'test panel'}>
    {textarea}
  </PanelView>,
})

textarea.focus()
panel.focus()
