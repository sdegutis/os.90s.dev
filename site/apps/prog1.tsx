import { Panel } from "../client/core/panel.js"
import { PanelView } from "../client/util/panelview.js"


const panel = await Panel.create(
  <PanelView title={'Font Maker'}>
    <view />
  </PanelView>
)

panel.focusPanel()
