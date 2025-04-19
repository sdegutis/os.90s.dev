import { Panel } from "../core/panel.js"
import { Point } from "../core/types.js"
import { Border } from "../views/border.js"
import { Button } from "../views/button.js"
import { GroupY } from "../views/group.js"
import { Label } from "../views/label.js"
import { View } from "../views/view.js"
import { subpanel } from "./subpanel.js"

export type MenuItem = { text: string, onClick(): void, disabled?: boolean } | '-'

const borderColor = 0x444444ff
const bgColor = 0x333333ff

export async function showMenu(panel: Panel, items: MenuItem[], from?: Point) {
  const group = (
    <GroupY gap={0} align={'+'}>
      {items.flatMap(item => {
        if (item === '-') {
          return [
            <View size={{ w: 0, h: 1 }} />,
            <View background={borderColor} size={{ w: 0, h: 1 }} />,
            <View size={{ w: 0, h: 1 }} />,
          ]
        }
        return <Button padding={2} onClick={async () => {
          if (item.disabled) return
          await sub.close()
          item.onClick()
        }}>
          <Label text={item.text} />
        </Button>
      })}
    </GroupY>
  )

  const menu = (
    <Border
      onKeyPress={key => {
        if (key === 'escape') sub.close()
        return true
      }}
      canFocus={true}
      onPanelBlur={() => { sub.close() }}
      paddingColor={borderColor}
      padding={1}
      background={bgColor}
    >
      <Border padding={1}>
        {group}
      </Border>
    </Border>
  )

  const sub = subpanel(panel, menu, from ?? panel.mouse)
}
