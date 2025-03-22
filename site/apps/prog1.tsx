import { program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { showPrompt } from "../client/util/prompt.js"
import { $, multiplex } from "../client/util/ref.js"

const size = $({ w: 100, h: 100 })

const textarea = <textarea text={''} background={0x99000099} multiline={false} onEnter={function () {
  console.log('hey', this.text)
}} />

// const textarea = <textarea />

// const scroll = <scroll
//   background={0xffffff11}
//   onMouseDown={function (...args) { this.content?.onMouseDown?.(...args) }}
// >
//   {textarea}
// </scroll>

const panel = await program.makePanel({
  size,
  view: <PanelView size={size} title={'test panel'}>
    <panedyb>
      <scroll
        // showv={false}
        // showh={false}
        adoptedByParent={function (p) {
          multiplex([textarea.$ref('size'), p.$ref('size')], () => {
            this.point = { x: 5, y: 0 }
            this.size = { w: p.size.w - 10, h: textarea.size.h }
          })
        }}
        background={0xffffff11}
        onMouseDown={function (...args) { this.firstChild?.onMouseDown?.(...args) }}
      >
        {textarea}
      </scroll>
      <groupx>
        <button onClick={async () => {
          console.log(await showPrompt('hey? hows it going?\nwell this is fine'))
        }} padding={3}><label text={'hmm'} /></button>
      </groupx>
    </panedyb>
  </PanelView>,
})

textarea.focus()
panel.focus()
