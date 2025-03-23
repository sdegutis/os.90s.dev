import { program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"

const size = $({ w: 75, h: 50 })

const panel = await program.makePanel({
  size,
  pos: 'center',
  view: <PanelView size={size} title={'test panel'}>
    <splitx>

      <scroll background={0xffffff11} onMouseDown={function (...args) { this.content?.onMouseDown?.(...args) }}>
        <textarea presented={function () {
          this.focus()
        }} />
      </scroll>
      <groupy>
        <button padding={2}><label text={'hmm'} /></button>
        <button padding={2}><label text={'hmm'} /></button>
        <button padding={2}><label text={'hmm'} /></button>
      </groupy>
    </splitx>
  </PanelView>,
})

panel.focus()
