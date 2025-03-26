import { Panel } from "../client/core/panel.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../shared/ref.js"

const TEST = `
this is a long string
it has multiple lines
hmm
it is not colorful yet...
`.trim()

const panel = await Panel.create(
  <PanelView title={'Writer'} size={$({ w: 100, h: 70 })}>
    <splitya>
      <button><label text={'hmm'} /></button>
      <scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
        <border padding={2}>
          <label text={TEST} />
        </border>
      </scroll>
    </splitya>
  </PanelView>
)

panel.focusPanel()
