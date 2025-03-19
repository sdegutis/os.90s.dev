import { Bitmap } from "../../shared/bitmap.js"
import { Cursor } from "../../shared/cursor.js"
import { dragMove } from "../util/drag.js"
import { colorFor, make, view, type Pos } from "./view.js"

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

  readonly split!: split
  override passthrough: boolean = false

  readonly pressed: boolean = false
  readonly dividerColor: number = 0x33333300

  override init(): void {
    this.addRedrawKeys('hovered', 'pressed')
    this.mutate(v => v.background = this.dividerColor)
    // this.cursor = this.split.dir === 'x' ? xresize : yresize

  }

  override onResized(): void { }

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    const dividerColorHover = 0xffffff33
    const dividerColorPress = 0x1177ffcc
    const dividerWidth = 1

    const dx = this.split.dir
    const dw = dx === 'x' ? 'w' : 'h'

    const x = dx === 'x' ? Math.round((this[dw] - dividerWidth) / 2) : 0
    const y = dx === 'y' ? Math.round((this[dw] - dividerWidth) / 2) : 0
    const w = dx === 'x' ? dividerWidth : this.w
    const h = dx === 'y' ? dividerWidth : this.h

    if (this.pressed) {
      ctx.fillStyle = colorFor(dividerColorPress)
      ctx.fillRect(px + x, py + y, w, h)
    }
    else if (this.hovered) {
      ctx.fillStyle = colorFor(dividerColorHover)
      ctx.fillRect(px + x, py + y, w, h)
    }
  }

  override onMouseDown(button: number, pos: Pos): void {
    const split = this.split
    const dx = split.dir
    const dw = dx === 'x' ? 'w' : 'h'

    const b = {
      x: 0, y: 0, move(x: number, y: number) {
        b.x = x
        b.y = y

        const s = split.mutable()
        s.pos = b[dx]
        if (s.min && s.pos < s.min) s.pos = s.min
        if (s.max && s.pos > s[dw] - s.max) s.pos = s[dw] - s.max
        s.commit()
      }
    }
    b[dx] = split.pos

    this.mutate(v => v.pressed = true)

    const drag = dragMove(pos, b)
    this.onMouseMove = drag
    this.onMouseUp = () => {
      this.mutate(v => v.pressed = false)
    }
  }

}

export class split extends view {

  readonly pos: number = 10
  readonly min: number = 0
  readonly max: number = 0
  readonly dir: 'x' | 'y' = 'y'

  resizer?: SplitDivider

  override init(): void {
    this.addLayoutKeys('pos')
    this.resizer = make(SplitDivider, { split: this })
    const mthis = this.mutable()
    mthis.children = [...this.children, this.resizer]
    mthis.commit()
  }

  override onNeedsLayout(): void {
    this.layoutTree()
  }

  override onChildResized(): void {
    this.adjust?.()
    this.layoutTree()
  }

  override layout(): void {
    const dx = this.dir
    const dw = dx === 'x' ? 'w' : 'h'
    const a = this.children[0].mutable()
    const b = this.children[1].mutable()

    a.x = b.x = 0
    a.y = b.y = 0
    a.w = b.w = this.w
    a.h = b.h = this.h

    a[dw] = this.pos

    b[dx] = this.pos
    b[dw] = this[dw] - this.pos

    this.resizer?.mutate(r => {
      r.x = 0
      r.y = 0
      r[dx] = this.pos - 1

      r.w = this.w
      r.h = this.h
      r[dw] = 2
    })

    a.commit()
    b.commit()
  }

}

export class splitx extends split {
  override dir = 'x' as const
}

export class splity extends split {
  override dir = 'y' as const
}
