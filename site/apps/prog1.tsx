import { program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"

const size = $({ w: 100, h: 100 })

const panel = await program.makePanel({
  size,
  pos: 'center',
  view: <PanelView size={size} title={'test panel'}>
    <scroll background={0xffffff11} onMouseDown={function (...args) { this.content?.onMouseDown?.(...args) }}>
      <textarea adoptedByPanel={function () {
        this.focus()
      }} />
    </scroll>
  </PanelView>,
})

panel.focus()
