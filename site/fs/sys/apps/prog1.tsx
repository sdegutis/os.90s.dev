// @ts-nocheck
// import { Panel } from "/client/core/panel.js"
// import { $ } from "/client/core/ref.js"
// import { PanelView } from "/client/util/panelview.js"

const TEST = `
this is a long string
it has multiple lines
hmm
it is not colorful yet...
`.trim()

const panel = await Panel.create(
  <PanelView title={$('FONT MAKER 1 font maker 2')} size={$({ w: 100, h: 70 })}>
    <scroll>
      <textarea text={TEST} />
    </scroll>
  </PanelView>
)

panel.focusPanel()
