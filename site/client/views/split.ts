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
  override readonly passthrough: boolean = false

  readonly pressed: boolean = false
  readonly dividerColor: number = 0x33333300

  private cursor!: Cursor

  override init(): void {
    this.addRedrawKeys('hovered', 'pressed')
    this.mutate(v => v.background = this.dividerColor)
    this.cursor = this.split.dir === 'x' ? xresize : yresize
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

  private cursorClaims = 0
  private cursorClaim(n: number) {
    this.cursorClaims += n
    if (this.cursorClaims === 0) {
      this.getPanel?.setCursor(null)
    }
    else if (this.cursorClaims === n) {
      this.getPanel?.setCursor(this.cursor)
    }
  }

  override onMouseEnter(): void {
    this.cursorClaim(1)
  }

  override onMouseExit(): void {
    this.cursorClaim(-1)
  }

  override onMouseDown(button: number, pos: Pos): void {
    this.cursorClaim(1)
    const split = this.split
    const dx = split.dir
    const dw = dx === 'x' ? 'w' : 'h'

    const b = {
      x: 0, y: 0, move(x: number, y: number) {
        b.x = x
        b.y = y

        let min = split.min
        let max = split.max

        if (min < 0) min = split[dw] + min
        if (max < 0) max = split[dw] + max

        const s = split.mutable()
        s.pos = b[dx]
        if (min && s.pos < min) s.pos = min
        if (max && s.pos > max) s.pos = max
        s.commit()
      }
    }
    b[dx] = split.pos

    this.mutate(v => v.pressed = true)

    this.onMouseMove = dragMove(pos, b)
    this.onMouseUp = () => {
      this.cursorClaim(-1)
      this.mutate(v => v.pressed = false)
      delete this.onMouseMove
      delete this.onMouseUp
    }
  }

}

export class split extends view {

  readonly pos: number = 10
  readonly min: number = 0
  readonly max: number = 0
  readonly dir: 'x' | 'y' = 'y'

  resizer!: SplitDivider

  override init(): void {
    this.addLayoutKeys('pos', 'dir')
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

    this.resizer.mutate(r => {
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
