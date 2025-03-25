import { Bitmap } from "../../shared/bitmap.js"
import { Cursor } from "../../shared/cursor.js"
import { $, type Ref } from "../../shared/ref.js"
import type { Panel } from "../core/panel.js"
import type { ImageView } from "../views/image.js"
import type { SpacedX } from "../views/spaced.js"
import type { View } from "../views/view.js"
import { dragMove, dragResize } from "./drag.js"
import type { Size } from "./types.js"

const minImage = new Bitmap([0xffffff33], 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,])
const maxImage = new Bitmap([0xffffff33], 4, [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1,])
const axeImage = new Bitmap([0xffffff33], 4, [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,])
const mnuImage = new Bitmap([0xffffff33], 4, [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1])
const adjImage = new Bitmap([0xffffff77], 3, [0, 0, 1, 0, 0, 1, 1, 1, 1,])

const adjCursor = new Cursor(2, 2, new Bitmap([0x000000cc, 0xffffffff], 5, [
  0, 1, 1, 1, 0,
  1, 1, 2, 1, 1,
  1, 2, 2, 2, 1,
  1, 1, 2, 1, 1,
  0, 1, 1, 1, 0,
]))

export function PanelView(data: {
  size?: Ref<Size>,
  title: string | Ref<string>, children: View,
}) {

  const size = data.size ?? $({ w: 200, h: 150 })

  let panel: Panel

  const focused = $(false)
  const borderColor = focused.adapt<number>(b => b ? 0x005599ff : 0x00559944)

  function titleBarMouseDown(this: SpacedX, button: number) {
    this.onMouseUp = dragMove(panel.$absmouse, panel)
  }

  function minw() { /* panel.min() */ }
  function maxw() { /* panel.max() */ }
  function axew() { panel.close() }

  return (
    <margin
      paddingColor={borderColor}
      padding={1}
      size={size}
      presented={p => panel = p}
      onPanelFocus={() => focused.val = true}
      onPanelBlur={() => focused.val = false}
      background={0x070707dd}
    >
      <panedya gap={-1}>

        <spacedx canMouse onMouseDown={titleBarMouseDown}>
          <border>
            <groupx gap={1}>
              <button padding={2}><image bitmap={mnuImage} /></button>
              <label text={data.title} />
            </groupx>
          </border>
          <border>
            <groupx>
              <button padding={2} onClick={minw}><image bitmap={minImage} /></button>
              <button padding={2} onClick={maxw}><image bitmap={maxImage} /></button>
              <CloseB padding={2} onClick={axew}><image bitmap={axeImage} /></CloseB>
            </groupx>
          </border>
        </spacedx>

        <margin padding={1}>
          {data.children}
        </margin>

      </panedya>

      <PanelResizer size={size} />

    </margin>
  )

}

function CloseB(data: JSX.DataFor<'button'>) {
  return <button {...data} hoverBackground={0x99000055} pressBackground={0x44000099} />
}

function PanelResizer(data: { size: Ref<Size> }) {

  let panel: Panel

  function resizerMouseDown(this: ImageView, button: number) {
    panel.pushCursor(adjCursor)
    const done = dragResize(panel.$mouse, panel.$size)
    this.onMouseUp = () => {
      panel.popCursor(adjCursor)
      done()
      delete this.onMouseUp
    }
  }

  return <image
    canMouse
    presented={p => panel = p}
    bitmap={adjImage}
    onMouseEnter={function (this: View) { panel.pushCursor(adjCursor) }}
    onMouseExit={function (this: View) { panel.popCursor(adjCursor) }}
    point={data.size.adapt(s => ({
      x: s.w - adjImage.width,
      y: s.h - adjImage.height,
    }))}
    onMouseDown={resizerMouseDown}
  />

}
