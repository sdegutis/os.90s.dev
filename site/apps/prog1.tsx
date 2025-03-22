import { Program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { $, multiplex } from "../client/util/ref.js"

const prog = new Program()
await prog.init()

const size = $({ w: 100, h: 100 })

const textarea = <textarea text={'hello😭lol'} background={0x99000099} multiline={false} onEnter={function () {
  console.log('hey', this.text)
}} />

const panel = await prog.makePanel({
  size,
  view: <PanelView size={size} title={'test panel'}>
    <panedyb>
      <view>
        <scroll
          showv={false}
          showh={false}
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
      </view>
      <groupx>
        <button padding={3}><label text={'test1'} /></button>
        <button padding={3}><label text={'test2'} /></button>
      </groupx>
    </panedyb>
  </PanelView>,
})

textarea.focus()
panel.focus()
