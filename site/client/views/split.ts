import { colorFor } from "../util/colors.js"
import { xresize, yresize } from "../util/cursors.js"
import { dragMove } from "../util/drag.js"
import { make } from "../util/dyn.js"
import { debounce } from "../util/throttle.js"
import { View } from "./view.js"

class SplitDivider extends View {

  split!: Split
  override passthrough: boolean = false
  override pressed: boolean = false

  get cursor() {
    return this.split.dir === 'x' ? xresize : yresize
  }

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    if (this.pressed) {
      this.drawBackground(ctx, px, py, colorFor(this.split.dividerColorPressed))
    }
    else if (this.hovered && this.split.min !== this.split.max) {
      this.drawBackground(ctx, px, py, colorFor(this.split.dividerColorHovered))
    }
  }

  override onMouseEnter(): void {
    this.panel?.pushCursor(this.cursor)
  }

  override onMouseExit(): void {
    this.panel?.popCursor()
  }

  override onMouseDown(button: number): void {
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

    this.onMouseMove = dragMove(this.panel!.mouse, b)
    this.onMouseUp = () => {
      this.panel?.popCursor()
      this.pressed = false
      delete this.onMouseMove
      delete this.onMouseUp
    }
  }

}

export class Split extends View {

  dividerColorHovered = 0xffffff33
  dividerColorPressed = 0x1177ffcc

  pos: number = 20
  min: number = 10
  max: number = -10
  dir: 'x' | 'y' = 'y'
  stick: 'a' | 'b' = 'a'

  resizer?: SplitDivider

  override init(): void {
    const fixpos = debounce(() => {
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
    })

    this.$.dir.watch(fixpos)
    this.$.pos.watch(fixpos)
    this.$.size.watch(fixpos)

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
