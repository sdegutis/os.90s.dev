import { Program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"
import type { view } from "../client/views/view.js"

const prog = new Program()
await prog.init()

const ch = $<view[]>([])

const children = $([
  <button padding={2}><label text={'hey'} /></button>,
  ...Array(20).keys().map(i => <label text={`view ${i.toString()}`} />)
])

const panel = await prog.makePanel({
  size: [100, 100],
  view: <PanelView title={'test panel'}>
    <scroll background={0x00330099}>
      <border background={0x00009999} padding={2}>
        <groupy gap={2} align={'a'}>
          {children}
        </groupy>
      </border>
    </scroll>

    {/* <panedya background={0x00330099}>
      <border padding={3} background={0x99000099}>
        <border padding={3} background={0x00009999}>
          <groupy gap={2} background={0x00003399} children={ch} />
        </border>
      </border>
      <label text={'yep'} background={0x33000099} />
    </panedya> */}
  </PanelView>,
})
