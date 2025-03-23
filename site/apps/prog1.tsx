import { program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"
import type { view } from "../client/views/view.js"

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
        <button onClick={function () { showMenu(this) }} padding={2}><label text={'test'} /></button>
      </groupx>
    </panedyb>
  </PanelView>,
})

panel.focus()

async function showMenu(from: view) {

  console.log(from)


  const size = $({ w: 50, h: 50 })
  const panel = await program.makePanel({
    size,
    pos: $({
      x: from.panelOffset.x + from.panel!.point.x,
      y: from.panelOffset.y + from.panel!.point.y,
    }),
    order: 'top',
    view: (
      <view size={size} background={0x99000099} />
    )
  })

}
