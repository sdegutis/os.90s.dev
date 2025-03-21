import { Bitmap } from "../../shared/bitmap.js"
import { Cursor } from "../../shared/cursor.js"
import { dragMove } from "../util/drag.js"
import { make, view, type Point } from "./view.js"

const xresize = new Cursor(2, 1, new Bitmap([0x00000099, 0xffffffff], 5, [
  1, 1, 1, 1, 1,
  1, 2, 2, 2, 1,
  1, 1, 1, 1, 1,
]))

const yresize = new Cursor(1, 2, new Bitmap([0x00000099, 0xffffffff], 3, [
  1, 1, 1,
  1, 2, 1,
  1, 2, 1,
  1, 2, 1,
  1, 1, 1,
]))

class SplitDivider extends view {

  split!: split
  override  passthrough: boolean = false

  pressed: boolean = false
  dividerColor: number = 0x33333300

  private cursor!: Cursor

  override init(): void {
    this.addRedrawKeys('hovered', 'pressed')
    this.background = this.dividerColor
    this.cursor = this.split.dir === 'x' ? xresize : yresize
  }

  override onResized(): void { }

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    if (this.split.min === this.split.max) return

    const dividerColorHover = 0xffffff33
    const dividerColorPress = 0x1177ffcc
    const dividerWidth = 1

    const dx = this.split.dir
    const dw = dx === 'x' ? 'w' : 'h'

    // const x = dx === 'x' ? Math.round((this[dw] - dividerWidth) / 2) : 0
    // const y = dx === 'y' ? Math.round((this[dw] - dividerWidth) / 2) : 0
    // const w = dx === 'x' ? dividerWidth : this.size.w
    // const h = dx === 'y' ? dividerWidth : this.size.h

    // if (this.pressed) {
    //   ctx.fillStyle = colorFor(dividerColorPress)
    //   ctx.fillRect(px + x, py + y, w, h)
    // }
    // else if (this.hovered) {
    //   ctx.fillStyle = colorFor(dividerColorHover)
    //   ctx.fillRect(px + x, py + y, w, h)
    // }
  }

  private cursorClaims = 0
  private cursorClaim(n: number) {
    this.cursorClaims += n
    if (this.cursorClaims === 0) {
      this.panel?.setCursor(null)
    }
    else if (this.cursorClaims === n) {
      if (this.split.min === this.split.max) return
      this.panel?.setCursor(this.cursor)
    }
  }

  override onMouseEnter(): void {
    this.cursorClaim(1)
  }

  override onMouseExit(): void {
    this.cursorClaim(-1)
  }

  override onMouseDown(button: number, pos: Point): void {
    this.cursorClaim(1)
    const split = this.split
    const dx = split.dir
    const dw = dx === 'x' ? 'w' : 'h'

    const b = {
      x: split.pos,
      y: split.pos,
      move(x: number, y: number) {
        b.x = x
        b.y = y

        let min = split.min
        let max = split.max

        // if (min < 0) min += split[dw]
        // if (max <= 0) max += split[dw] - 1

        split.pos = b[dx]
        if (split.pos < min) split.pos = min
        if (split.pos > max) split.pos = max
      }
    }

    this.pressed = true

    this.onMouseMove = dragMove(pos, b)
    this.onMouseUp = () => {
      this.cursorClaim(-1)
      this.pressed = false
      delete this.onMouseMove
      delete this.onMouseUp
    }
  }

}

export class split extends view {

  pos: number = 10
  min: number = 0
  max: number = 0
  dir: 'x' | 'y' = 'y'

  resizer?: SplitDivider

  override init(): void {
    this.addLayoutKeys('pos', 'dir')
    this.resizer = make(SplitDivider, { split: this })
    this.children = [...this.children, this.resizer]
  }

  override onChildResized(): void {
    this.adjust?.()
    this.layoutTree()
  }

  override layout(): void {
    // const dx = this.dir
    // const dw = dx === 'x' ? 'w' : 'h'
    // const a = this.children[0]
    // const b = this.children[1]

    // a.point.x = b.point.x = 0
    // a.point.y = b.point.y = 0
    // a.w = b.w = this.w
    // a.h = b.h = this.h

    // a[dw] = this.pos

    // b[dx] = this.pos
    // b[dw] = this[dw] - this.pos

    // if (this.resizer) {
    //   this.resizer.point.x = 0
    //   this.resizer.point.y = 0
    //   this.resizer[dx] = this.pos - 1

    //   this.resizer.w = this.w
    //   this.resizer.h = this.h
    //   this.resizer[dw] = 2
    // }
  }

}

export class splitx extends split {
  override dir = 'x' as const
}

export class splity extends split {
  override dir = 'y' as const
}
