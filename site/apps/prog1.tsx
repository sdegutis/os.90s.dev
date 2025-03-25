import { Panel } from "../client/core/panel.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../shared/ref.js"

const panel = await Panel.create(
  <PanelView title={'Writer'} size={$({ w: 100, h: 70 })}>
    <scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      <textarea autofocus />
    </scroll>
  </PanelView>
)

panel.focusPanel()
