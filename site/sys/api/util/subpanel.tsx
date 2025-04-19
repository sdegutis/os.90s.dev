import { Panel } from "../core/panel.js"
import { Point } from "../core/types.js"
import { View } from "../views/view.js"
import { sleep } from "./sleep.js"

export function subpanel(panel: Panel, view: View, from: Point) {
  let pos = { ...from }
  if (pos.y + view.size.h > panel.size.h) pos.y -= view.size.h
  if (pos.x + view.size.w > panel.size.w) pos.x -= view.size.w
  view.point = pos

  const sub = <View
    onKeyPress={key => {
      if (key === 'escape') { close(); return true }
      return false
    }}
    canFocus
    background={0x00000033}
    canMouse
    onMouseDown={close}
    size={panel.$size}
    children={[view]}
  />

  async function close() {
    panel.root.removeChild(sub)
    await sleep(0)
    focused?.focus()
  }

  panel.root.addChild(sub)

  const focused = panel.focused
  sub.focus()

  return {
    close,
  }
}
