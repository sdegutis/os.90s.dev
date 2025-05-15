import type { DrawingContext } from "../core/drawing.js"
import { JsxAttrs } from "../core/jsx.js"
import { $, makeRef } from "../core/ref.js"
import { sys } from "../core/sys.js"
import { xresize, yresize } from "../util/cursors.js"
import { dragMove } from "../util/drag.js"
import { View } from "./view.js"

class SplitDivider extends View {

  constructor(config: JsxAttrs<SplitDivider>) {
    super()
    this.setup(config)

    this.canMouse = true
    this.pressed = false
  }

  split!: Split

  get cursor() {
    return this.split.dir === 'x' ? xresize : yresize
  }

  override draw(ctx: DrawingContext): void {
    if (this.pressed) {
      this.drawBackground(ctx, this.split.dividerColorPressed)
    }
    else if (this.hovered && this.split.min !== this.split.max) {
      this.drawBackground(ctx, this.split.dividerColorHovered)
    }
  }

  override onMouseEnter(): void {
    sys.pushCursor(this.cursor)
  }

  override onMouseExit(): void {
    sys.popCursor(this.cursor)
  }

  override onMouseDown(button: number): void {
    sys.pushCursor(this.cursor)
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
      sys.popCursor(this.cursor)
      this.pressed = false
      delete this.onMouseUp
    }
  }

}

export class Split extends View {

  constructor(config?: JsxAttrs<Split>) {
    super()
    this.setup(config)
  }

  override init(): void {
    super.init()

    this.$dir.watch(() => { this.layout(); this.needsRedraw() })
    this.$pos.watch(() => { this.layout(); this.needsRedraw() })
    this.$size.watch(() => { this.layout(); this.needsRedraw() })

    this.$pos.intercept((pos) => {
      if (this.size.w === 0 || this.size.h === 0) return pos

      const dx = this.dir
      const dw = dx === 'x' ? 'w' : 'h'

      let min = this.min
      let max = this.max

      if (min < 0) min += this.size[dw]
      if (max <= 0) max += this.size[dw] - 1

      return Math.max(min, Math.min(pos, max))
    }, [this.$min, this.$max, this.$size])

    this.resizer = <SplitDivider split={this} /> as SplitDivider
    this.children = [...this.children, this.resizer]
  }

  dividerColorHovered = 0xffffff11
  dividerColorPressed = 0x1177ffcc

  pos = 20; readonly $pos = makeRef(this, 'pos')
  min = 10; readonly $min = makeRef(this, 'min')
  max = -10; readonly $max = makeRef(this, 'max')

  dir: 'x' | 'y' = 'y'
  readonly $dir = makeRef(this, 'dir')

  stick: 'a' | 'b' = 'a'
  readonly $stick = makeRef(this, 'stick')


  resizer?: SplitDivider

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
  constructor(config?: JsxAttrs<Split>) {
    super()
    this.dir = 'x'
    this.stick = 'a'
    this.setup(config)
  }
}

export class SplitYA extends Split {
  constructor(config?: JsxAttrs<Split>) {
    super()
    this.dir = 'y'
    this.stick = 'a'
    this.setup(config)
  }
}

export class SplitXB extends Split {
  constructor(config?: JsxAttrs<Split>) {
    super()
    this.dir = 'x'
    this.stick = 'b'
    this.setup(config)
  }
}

export class SplitYB extends Split {
  constructor(config?: JsxAttrs<Split>) {
    super()
    this.dir = 'y'
    this.stick = 'b'
    this.setup(config)
  }
}
