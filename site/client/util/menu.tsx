import { $ } from "../../shared/ref.js"
import { Panel } from "../core/panel.js"
import { program } from "../core/prog.js"
import type { Point } from "./types.js"

export type MenuItem = { text: string, onClick(): void } | '-'

const borderColor = 0xffffff11
const bgColor = 0x222222bb

export async function showMenu(from: Point, items: MenuItem[]) {
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

  if (from.y + root.size.h > program.size.h) {
    from = { ...from, y: from.y - root.size.h }
  }

  if (from.x + root.size.w > program.size.w) {
    from = { ...from, x: from.x - root.size.w }
  }

  const panel = await Panel.create(root, { pos: $(from), order: 'top' })

  panel.focusPanel()
  root.focus()
}
