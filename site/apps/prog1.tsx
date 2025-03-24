import { Panel } from "../client/core/panel.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../shared/ref.js"


const panel = await Panel.create(
  <PanelView size={$({ w: 75, h: 50 })} title={'test panel'}>
    <view />
  </PanelView>
)

panel.focusPanel()
