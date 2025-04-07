import { Panel } from "../core/panel.js"
import { sys } from "../core/sys.js"
import { Border } from "../views/border.js"
import { Button } from "../views/button.js"
import { GroupX, GroupY } from "../views/group.js"
import { Label } from "../views/label.js"
import { dragMove } from "./drag.js"

export async function showDialog(text: string) {
  const result = Promise.withResolvers<boolean>()

  const dialog = <Border
    canMouse
    onPanelBlur={() => {
      panel.focusPanel()
      no()
    }}
    canFocus={true}
    onKeyDown={key => {
      if (key === 'Enter') ok()
      if (key === 'Escape') no()
      return true
    }}
    onMouseDown={function (b) {
      this.onMouseUp = dragMove(sys.$mouse, panel.$point)
    }}
    background={0x222222ff} padding={1} paddingColor={0x005599ff}>
    <Border padding={3}>
      <GroupY align={'m'} gap={4}>
        <Border padding={2}>
          <Label text={text} />
        </Border>
        <GroupX gap={2}>
          <Button onClick={no} background={0x99000099} padding={2}><Label text={'cancel'} /></Button>
          <Button onClick={ok} background={0xffffff33} padding={2}><Label text={'ok'} /></Button>
        </GroupX>
      </GroupY>
    </Border>
  </Border>

  const panel = await Panel.create({ name: 'dialog', pos: 'center' }, dialog)

  panel.focusPanel()
  dialog.focus()

  function ok() { panel.close(); result.resolve(true) }
  function no() { panel.close(); result.resolve(false) }

  return result.promise
}
