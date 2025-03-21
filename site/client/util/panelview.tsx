import { Bitmap } from "../../shared/bitmap.js"
import { Cursor } from "../../shared/cursor.js"
import type { Panel } from "../core/panel.js"
import type { border } from "../views/border.js"
import type { image } from "../views/image.js"
import type { spacedx } from "../views/spaced.js"
import type { Point, Size, view } from "../views/view.js"
import { dragMove, dragResize } from "./drag.js"
import { $, Ref } from "./ref.js"

const minImage = new Bitmap([0x333333ff], 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,])
const maxImage = new Bitmap([0x333333ff], 4, [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1,])
const axeImage = new Bitmap([0x333333ff], 4, [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,])
const mnuImage = new Bitmap([0x333333ff], 4, [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1])
const adjImage = new Bitmap([0xffffff77], 3, [0, 0, 1, 0, 0, 1, 1, 1, 1,])

const adjCursor = new Cursor(2, 2, new Bitmap([0x000000cc, 0xffffffff], 5, [
  0, 1, 1, 1, 0,
  1, 1, 2, 1, 1,
  1, 2, 2, 2, 1,
  1, 1, 2, 1, 1,
  0, 1, 1, 1, 0,
]))

export function PanelView(data: { size: Ref<Size>, title: string | Ref<string>, children: view }) {

  let panel: Panel
  const adopted = function (this: view) { panel = this.panel! }

  const focused = $(false)
  const borderColor = focused.adapt<number>(b => b ? 0x005599ff : 0x00559944)

  function titleBarMouseDown(this: spacedx, button: number, pos: Point) {
    this.onMouseMove = dragMove(pos, panel)
    this.onMouseUp = () => {
      delete this.onMouseMove
      delete this.onMouseUp
    }
  }

  function minw() { }

  function maxw() { }

  function axew() {
    panel.close()
  }

  function layoutContentView(this: border) {
    const c = this.firstChild
    if (c) {
      c.point = { x: 1, y: 0 }
      c.size = {
        w: this.size.w - 2,
        h: this.size.h - 1,
      }
    }
  }

  const toplevel = {
    onPanelFocus: () => focused.val = true,
    onPanelBlur: () => focused.val = false,
  }

  const sizeMinus2 = data.size.adapt(s => ({
    w: s.w - 2,
    h: s.h - 2,
  }))

  function PanelResizer() {

    let claims = 0
    function setClaims(n: number) {
      claims += n
      if (claims === 0) {
        panel.setCursor(null)
      }
      else if (claims === n) {
        panel.setCursor(adjCursor)
      }
    }

    function resizerMouseDown(this: image, button: number, pos: Point) {
      setClaims(1)
      this.onMouseMove = dragResize(pos, panel)
      this.onMouseUp = () => {
        setClaims(-1)
        delete this.onMouseMove
        delete this.onMouseUp
      }
    }

    return <image
      passthrough={false}
      bitmap={adjImage}
      onMouseEnter={() => setClaims(+1)}
      onMouseExit={() => setClaims(-1)}
      layout={function () {
        if (!this.parent) return
        this.point = {
          x: this.parent!.size.w - this.size.w,
          y: this.parent!.size.h - this.size.h,
        }
      }}
      onMouseDown={resizerMouseDown}
    />
  }

  return <view size={data.size} adopted={adopted} background={0x070707dd} {...toplevel}>
    <border borderColor={borderColor} padding={1}>

      <panedya size={sizeMinus2} gap={0}>

        <spacedx onMouseDown={titleBarMouseDown}>
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

        <border layout={layoutContentView}>
          {data.children}
        </border>

      </panedya>

      <PanelResizer />

    </border>
  </view>

}

function CloseB(data: JSX.DataFor<'button'>) {
  return <button {...data} hoverBackground={0x99000055} pressBackground={0x44000099} />
}
