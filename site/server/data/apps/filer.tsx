import { Panel } from "/client/core/panel.js"
import { program } from "/client/core/prog.js"
import { $ } from "/client/core/ref.js"
import { PanelView } from "/client/util/panelview.js"

const drives = await program.listdrives('')

const panel = await Panel.create(
  <PanelView title={'Filer'} size={$({ w: 150, h: 120 })}>
    <splitxa pos={50}>
      <groupy gap={2} align={'a'} children={drives.map(d =>
        <button padding={2}><label text={d} /></button>
      )} />
      <scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
        <border padding={2}>
          <label />
        </border>
      </scroll>
    </splitxa>
  </PanelView>
)

panel.focusPanel()
