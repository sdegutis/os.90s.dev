import { Bitmap } from "../../shared/bitmap.js"
import { Cursor } from "../../shared/cursor.js"
import { colorFor } from "../util/colors.js"
import { dragMove } from "../util/drag.js"
import { debounce } from "../util/throttle.js"
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
    this.$multiplex('hovered', 'pressed').watch(() => this.needsRedraw())
    this.background = this.dividerColor
    this.cursor = this.split.dir === 'x' ? xresize : yresize
  }

  // override onResized(): void { }

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    if (this.split.min === this.split.max) return

    const dividerColorHover = 0xffffff33
    const dividerColorPress = 0x1177ffcc
    const dividerWidth = 1

    const dx = this.split.dir
    const dw = dx === 'x' ? 'w' : 'h'

    const x = dx === 'x' ? Math.round((this.size[dw] - dividerWidth) / 2) : 0
    const y = dx === 'y' ? Math.round((this.size[dw] - dividerWidth) / 2) : 0
    const w = dx === 'x' ? dividerWidth : this.size.w
    const h = dx === 'y' ? dividerWidth : this.size.h

    if (this.pressed) {
      ctx.fillStyle = colorFor(dividerColorPress)
      ctx.fillRect(px + x, py + y, w, h)
    }
    else if (this.hovered) {
      ctx.fillStyle = colorFor(dividerColorHover)
      ctx.fillRect(px + x, py + y, w, h)
    }
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

        if (min < 0) min += split.size[dw]
        if (max <= 0) max += split.size[dw] - 1

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
    this.$multiplex('dir', 'pos').watch(debounce(() => {
      this.layout()
      this.needsRedraw()
    }))

    this.resizer = make(SplitDivider, { split: this })
    this.children = [...this.children, this.resizer]
  }

  override layout(): void {
    const dx = this.dir
    const dw = dx === 'x' ? 'w' : 'h'
    const [a, b] = this.children

    const as = { ...a.size }
    const bs = { ...b.size }
    const ap = { ...a.point }
    const bp = { ...b.point }

    ap.x = bp.x = 0
    ap.y = bp.y = 0
    as.w = bs.w = this.size.w
    as.h = bs.h = this.size.h

    as[dw] = this.pos

    bp[dx] = this.pos
    bs[dw] = this.size[dw] - this.pos

    if (this.resizer) {
      const rp = { x: 0, y: 0 }
      rp[dx] = this.pos - 1
      this.resizer.point = rp

      const rs = { ...this.size }
      rs[dw] = 2
      this.resizer.size = rs
    }

    a.size = as
    b.size = bs
    a.point = ap
    b.point = bp
  }

}

export class splitx extends split {
  override dir = 'x' as const
}

export class splity extends split {
  override dir = 'y' as const
}
