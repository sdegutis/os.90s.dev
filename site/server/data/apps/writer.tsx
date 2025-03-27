import { Panel } from "/client/core/panel.js"
import { $ } from "/client/core/ref.js"
import { PanelView } from "/client/util/panelview.js"

const panel = await Panel.create(
  <PanelView title={'Writer'} size={$({ w: 100, h: 70 })}>
    <scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      <border canMouse padding={2} onMouseDown={function (b) { this.firstChild!.onMouseDown?.(b) }}>
        <textarea autofocus />
      </border>
    </scroll>
  </PanelView>
)

panel.focusPanel()
