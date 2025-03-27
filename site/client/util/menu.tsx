import { sys } from "../core/sys.js"
import { Panel } from "/client/core/panel.js"
import { $ } from "/client/core/ref.js"

export type MenuItem = { text: string, onClick(): void } | '-'

const borderColor = 0x444444ff
const bgColor = 0x333333ff

export async function showMenu(items: MenuItem[], from = sys.mouse) {
  const group = (
    <groupy gap={0} align={'+'}>
      {items.flatMap(item => {
        if (item === '-') {
          return [
            <view size={{ w: 0, h: 1 }} />,
            <view background={borderColor} size={{ w: 0, h: 1 }} />,
            <view size={{ w: 0, h: 1 }} />,
          ]
        }
        return <button padding={2} onClick={() => {
          item.onClick()
          panel.close()
        }}>
          <label text={item.text} />
        </button>
      })}
    </groupy>
  )

  const root = (
    <border
      onKeyDown={key => {
        if (key === 'Escape') panel.close()
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
      <border padding={1}>
        {group}
      </border>
    </border>
  )

  if (from.y + root.size.h > sys.size.h) {
    from = { ...from, y: from.y - root.size.h }
  }

  if (from.x + root.size.w > sys.size.w) {
    from = { ...from, x: from.x - root.size.w }
  }

  const panel = await Panel.create(root, { pos: $(from), order: 'top' })

  panel.focusPanel()
  root.focus()
}
