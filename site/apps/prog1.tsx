import { program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"

const size = $({ w: 75, h: 50 })

const panel = await program.makePanel({
  size,
  pos: 'center',
  view: <PanelView size={size} title={'test panel'}>
    <splitxa>
      <scroll background={0xffffff11} onMouseDown={function (...args) { this.content?.onMouseDown?.(...args) }}>
        <textarea presented={function () {
          this.focus()
        }} />
      </scroll>
      <margin padding={1} marginColor={0x000099ff}>
        <center background={0x99000033}>
          <button background={0x00990033} padding={2}><label text={'hmm'} /></button>
        </center>
      </margin>
    </splitxa>
  </PanelView>,
})

panel.focus()
