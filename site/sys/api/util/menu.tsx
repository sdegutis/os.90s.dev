import { Panel } from "../core/panel.js"
import { Point } from "../core/types.js"
import { Border } from "../views/border.js"
import { Button } from "../views/button.js"
import { GroupY } from "../views/group.js"
import { Label } from "../views/label.js"
import { View } from "../views/view.js"

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
        return <Button padding={2} onClick={() => {
          if (item.disabled) return
          item.onClick()
          close()
        }}>
          <Label text={item.text} />
        </Button>
      })}
    </GroupY>
  )

  const menu = (
    <Border
      onKeyPress={key => {
        if (key === 'escape') close()
        return true
      }}
      canFocus={true}
      onPanelBlur={() => { close() }}
      paddingColor={borderColor}
      padding={1}
      background={bgColor}
    >
      <Border padding={1}>
        {group}
      </Border>
    </Border>
  )

  let pos = { ...(from ?? panel.mouse) }
  if (pos.y + menu.size.h > panel.size.h) pos.y -= menu.size.h
  if (pos.x + menu.size.w > panel.size.w) pos.x -= menu.size.w
  menu.point = pos

  const root = <View
    background={0x00000033}
    canMouse
    onMouseDown={() => close()}
    size={panel.$size}
  >
    {menu}
  </View>

  const close = () => panel.root.children = panel.root.children.filter(v => v !== root)
  panel.root.children = [...panel.root.children, root]
}
