import type { Cursor } from "../../shared/cursor.js"
import { colorFor } from "../util/colors.js"
import { xresize, yresize } from "../util/cursors.js"
import { dragMove } from "../util/drag.js"
import { make } from "../util/dyn.js"
import { debounce } from "../util/throttle.js"
import { type Point } from "../util/types.js"
import { View } from "./view.js"

class SplitDivider extends View {

  split!: Split
  override  passthrough: boolean = false

  override pressed: boolean = false
  dividerColor: number = 0x33333300

  private cursor!: Cursor

  override init(): void {
    this.$$multiplex('hovered', 'pressed').watch(() => this.needsRedraw())
    this.background = this.dividerColor
    this.cursor = this.split.dir === 'x' ? xresize : yresize
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
    this.panel?.pushCursor(this.cursor)
  }

  override onMouseExit(): void {
    this.panel?.popCursor()
  }

  override onMouseDown(button: number, pos: Point): void {
    this.panel?.pushCursor(this.cursor)
    const split = this.split
    const dx = split.dir
    const dw = dx === 'x' ? 'w' : 'h'

    const sticka = split.stick === 'a'
    const p = sticka ? split.pos : split.size[dw] - split.pos

    const b = {
      get point() { return { x: p, y: p } },
      set point(p: { x: number, y: number }) {
        split.pos = sticka ? p[dx] : split.size[dw] - p[dx]
      }
    }

    this.pressed = true

    this.onMouseMove = dragMove(pos, b)
    this.onMouseUp = () => {
      this.panel?.popCursor()
      this.pressed = false
      delete this.onMouseMove
      delete this.onMouseUp
    }
  }

}

export class Split extends View {

  pos: number = 20
  min: number = 10
  max: number = -10
  dir: 'x' | 'y' = 'y'
  stick: 'a' | 'b' = 'a'

  resizer?: SplitDivider

  override init(): void {
    this.$$multiplex('dir', 'pos', 'size').watch(debounce(() => {
      const dx = this.dir
      const dw = dx === 'x' ? 'w' : 'h'

      let min = this.min
      let max = this.max

      if (min < 0) min += this.size[dw]
      if (max <= 0) max += this.size[dw] - 1

      if (this.pos < min) this.pos = min
      if (this.pos > max) this.pos = max

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

    let pos = this.pos
    if (this.stick === 'b') pos = this.size[dw] - pos

    as[dw] = pos

    bp[dx] = pos
    bs[dw] = this.size[dw] - pos

    if (this.resizer) {
      const rp = { x: 0, y: 0 }
      rp[dx] = pos - 1
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

export class SplitXA extends Split {
  override dir = 'x' as const
  override stick = 'a' as const
}

export class SplitYA extends Split {
  override dir = 'y' as const
  override stick = 'a' as const
}

export class SplitXB extends Split {
  override dir = 'x' as const
  override stick = 'b' as const
}

export class SplitYB extends Split {
  override dir = 'y' as const
  override stick = 'b' as const
}
