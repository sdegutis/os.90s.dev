import { Panel } from "../client/core/panel.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../shared/ref.js"

const panel = await Panel.create(
  <PanelView title={'Font Maker'} size={$({ w: 500, h: 300 })}>
    <scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      <textarea autofocus />
    </scroll>
  </PanelView>
)

panel.focusPanel()
