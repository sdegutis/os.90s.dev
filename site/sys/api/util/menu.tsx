import { sys } from "../core/sys.js"
import { Border } from "../views/border.js"
import { Button } from "../views/button.js"
import { GroupY } from "../views/group.js"
import { Label } from "../views/label.js"
import { View } from "../views/view.js"

export type MenuItem = { text: string, onClick(): void, disabled?: boolean } | '-'

const borderColor = 0x444444ff
const bgColor = 0x333333ff

export async function showMenu(items: MenuItem[], from = sys.mouse) {
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
          panel.close()
        }}>
          <Label text={item.text} />
        </Button>
      })}
    </GroupY>
  )

  const root = (
    <Border
      point={from}
      onKeyPress={key => {
        if (key === 'escape') panel.close()
        return true
      }}
      canFocus={true}
      onPanelBlur={() => {
        panel.focusPanel()
        panel.close()
      }}
      paddingColor={borderColor}
      padding={1}
      background={bgColor}
    >
      <Border padding={1}>
        {group}
      </Border>
    </Border>
  )

  if (root.point.y + root.size.h > sys.size.h) {
    root.point = { ...root.point, y: root.point.y - root.size.h }
  }

  if (root.point.x + root.size.w > sys.size.w) {
    root.point = { ...root.point, x: root.point.x - root.size.w }
  }

  const panel = await sys.makePanel({ name: 'menu', order: 'top' }, root)

  panel.focusPanel()
  root.focus()
}
