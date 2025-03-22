import { colorFor } from "../util/colors.js"
import { useCursor, xresize, yresize } from "../util/cursors.js"
import { dragMove } from "../util/drag.js"
import { debounce } from "../util/throttle.js"
import { type Point } from "../util/types.js"
import { make, view } from "./view.js"

class SplitDivider extends view {

  split!: split
  override  passthrough: boolean = false

  pressed: boolean = false
  dividerColor: number = 0x33333300

  cursor!: ReturnType<typeof useCursor>

  override init(): void {
    this.$multiplex('hovered', 'pressed').watch(() => this.needsRedraw())
    this.background = this.dividerColor
    this.cursor = useCursor(this, this.split.dir === 'x' ? xresize : yresize)
  }

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

  override onMouseEnter(): void {
    this.cursor.push()
  }

  override onMouseExit(): void {
    this.cursor.pop()
  }

  override onMouseDown(button: number, pos: Point): void {
    this.cursor.push()
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
      this.cursor.pop()
      this.pressed = false
      delete this.onMouseMove
      delete this.onMouseUp
    }
  }

}

export class split extends view {

  pos: number = 20
  min: number = 10
  max: number = -10
  dir: 'x' | 'y' = 'y'

  resizer?: SplitDivider

  override init(): void {
    this.$multiplex('dir', 'pos', 'size').watch(debounce(() => {
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
