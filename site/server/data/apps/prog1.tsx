import { Panel } from "/client/core/panel.js"
import { $ } from "/client/core/ref.js"
import { PanelView } from "/client/util/panelview.js"

const TEST = `
this is a long string
it has multiple lines
hmm
it is not colorful yet...
`.trim()

const panel = await Panel.create(
  <PanelView title={$('test prog 1')} size={$({ w: 100, h: 70 })}>
    <center>
      <button padding={2}>
        <label text={'onclick'} />
      </button>
    </center>
  </PanelView>
)

panel.focusPanel()
