import { Program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"

const prog = new Program()
await prog.init()

const size = $({ w: 100, h: 100 })

const textarea = <textarea background={0x99000099} multiline={true} onEnter={function () {
  console.log('hey', this.text)
}} />

let show = $(false)
setInterval(() => show.val = !show.val, 1000)

const panel = await prog.makePanel({
  size,
  view: <PanelView size={size} title={'test panel'}>
    <panedyb>
      <scroll
        showh={show}
        showv={show}
        background={0xffffff11}
        onMouseDown={function (...args) { this.firstChild?.onMouseDown?.(...args) }}
      >
        {textarea}
      </scroll>
      <groupx>
        <button padding={3}><label text={'test1'} /></button>
        <button padding={3}><label text={'test2'} /></button>
      </groupx>
    </panedyb>
  </PanelView>,
})

textarea.focus()
panel.focus()
