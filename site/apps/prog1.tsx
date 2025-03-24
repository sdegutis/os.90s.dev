import { program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"

const size = $({ w: 175, h: 150 })

const panel = await program.makePanel({
  size,
  pos: 'center',
  view: <PanelView size={size} title={'test panel'}>
    <splitxa pos={3}>
      <center background={0x00330099}>
        <button padding={2}><label text={'test'} /></button>
      </center>
      <scroll background={0xffffff11} onMouseDown={function (...args) { this.content?.onMouseDown?.(...args) }}>
        <textarea autofocus />
      </scroll>
    </splitxa>
  </PanelView>,
})

panel.focus()
