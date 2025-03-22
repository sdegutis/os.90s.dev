import { program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"

const size = $({ w: 100, h: 100 })

const panel = await program.makePanel({
  size,
  pos: 'center',
  view: <PanelView size={size} title={'test panel'}>
    <panedyb gap={2}>
      <scroll background={0xffffff11} onMouseDown={function (...args) { this.content?.onMouseDown?.(...args) }}>
        <textarea adoptedByPanel={function () {
          this.focus()
        }} />
      </scroll>
      <groupx>
        <button padding={2}><label text={'test'} /></button>
      </groupx>
    </panedyb>
  </PanelView>,
})

panel.focus()
