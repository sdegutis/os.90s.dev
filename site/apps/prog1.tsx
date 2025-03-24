import { program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"
import type { Split } from "../client/views/split.js"

const size = $({ w: 175, h: 150 })

const panel = await program.makePanel({
  size,
  pos: 'center',
  view: <PanelView size={size} title={'test panel'}>
    <splitxa>
      <margin padding={0} paddingColor={0x99000099}>
        <center background={0x00330099}>
          <button onClick={function () {
            const s = this.parent?.parent?.parent as Split
            s.dir = s.dir === 'x' ? 'y' : 'x'
          }} padding={2}><label text={'test'} /></button>
        </center>
      </margin>
      <scroll background={0xffffff11} onMouseDown={function (...args) { this.content?.onMouseDown?.(...args) }}>
        <textarea autofocus />
      </scroll>
    </splitxa>
  </PanelView>,
})

panel.focus()
