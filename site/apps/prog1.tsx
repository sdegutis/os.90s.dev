import { Panel } from "../client/core/panel.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../shared/ref.js"


const panel = await Panel.create(
  <PanelView size={$({ w: 175, h: 150 })} title={'Font Maker'}>
    <view />
  </PanelView>
)

panel.focusPanel()
