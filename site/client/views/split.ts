import type { DrawingContext } from "../core/drawing.js"
import { $ } from "../core/ref.js"
import { xresize, yresize } from "../util/cursors.js"
import { dragMove } from "../util/drag.js"
import { JsxAttrs, View } from "./view.js"

class SplitDivider extends View {

  split!: Split
  override canMouse: boolean = true
  override pressed: boolean = false

  get cursor() {
    return this.split.dir === 'x' ? xresize : yresize
  }

  override draw(ctx: DrawingContext, px: number, py: number): void {
    if (this.pressed) {
      this.drawBackground(ctx, px, py, this.split.dividerColorPressed)
    }
    else if (this.hovered && this.split.min !== this.split.max) {
      this.drawBackground(ctx, px, py, this.split.dividerColorHovered)
    }
  }

  override onMouseEnter(): void {
    this.panel?.pushCursor(this.cursor)
  }

  override onMouseExit(): void {
    this.panel?.popCursor(this.cursor)
  }

  override onMouseDown(button: number): void {
    this.panel?.pushCursor(this.cursor)
    const split = this.split
    const dx = split.dir
    const dw = dx === 'x' ? 'w' : 'h'
    const sticka = split.stick === 'a'

    this.pressed = true

    const p = sticka ? split.pos : split.size[dw] - split.pos
    const $b = $({ x: p, y: p })
    $b.watch(p => split.pos = sticka ? p[dx] : split.size[dw] - p[dx])

    const done = dragMove(this.panel!.$mouse, $b)
    this.onMouseUp = () => {
      done()
      this.panel?.popCursor(this.cursor)
      this.pressed = false
      delete this.onMouseUp
    }
  }

}

export class Split extends View {

  constructor(config?: JsxAttrs<Split>) { super() }

  dividerColorHovered = 0xffffff11
  dividerColorPressed = 0x1177ffcc

  pos: number = 20
  min: number = 10
  max: number = -10
  dir: 'x' | 'y' = 'y'
  stick: 'a' | 'b' = 'a'

  resizer?: SplitDivider

  override init(): void {
    this.$.dir.watch(() => { this.layout(); this.needsRedraw() })
    this.$.pos.watch(() => { this.layout(); this.needsRedraw() })
    this.$.size.watch(() => { this.layout(); this.needsRedraw() })

    this.$.pos.intercept((pos) => {
      if (this.size.w === 0 || this.size.h === 0) return pos

      const dx = this.dir
      const dw = dx === 'x' ? 'w' : 'h'

      let min = this.min
      let max = this.max

      if (min < 0) min += this.size[dw]
      if (max <= 0) max += this.size[dw] - 1

      return Math.max(min, Math.min(pos, max))
    }, [this.$.min, this.$.max, this.$.size])

    this.resizer = SplitDivider.make({ split: this })
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
  constructor(config?: JsxAttrs<SplitXA>) { super() }
  override dir = 'x' as const
  override stick = 'a' as const
}

export class SplitYA extends Split {
  constructor(config?: JsxAttrs<SplitYA>) { super() }
  override dir = 'y' as const
  override stick = 'a' as const
}

export class SplitXB extends Split {
  constructor(config?: JsxAttrs<SplitXB>) { super() }
  override dir = 'x' as const
  override stick = 'b' as const
}

export class SplitYB extends Split {
  constructor(config?: JsxAttrs<SplitYB>) { super() }
  override dir = 'y' as const
  override stick = 'b' as const
}
