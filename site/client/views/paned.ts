import { debounce } from "../util/throttle.js"
import { View } from "./view.js"

export class Paned extends View {

  gap: number = 0
  dir: 'x' | 'y' = 'x'
  vacuum: 'a' | 'b' = 'a'

  override init(): void {
    const relayout = debounce(() => {
      this.children.forEach(c => c.adjust?.())
      this.needsRedraw()
      this.layout()
    })

    this.$.gap.watch(relayout)
    this.$.dir.watch(relayout)
    this.$.vacuum.watch(relayout)

    this.layout()
  }

  override layout(): void {
    const [a, b] = this.children

    const as = { ...a.size }
    const bs = { ...b.size }
    const ap = { ...a.point }
    const bp = { ...b.point }

    const favored = ({ a: as, b: bs })[this.vacuum]

    const dx = this.dir
    const dw = dx === 'x' ? 'w' : 'h'
    const vv = favored[dw]

    ap.x = bp.x = 0
    ap.y = bp.y = 0
    as.w = bs.w = this.size.w
    as.h = bs.h = this.size.h

    if (this.vacuum === 'a') {
      const pos = vv
      as[dw] = pos
      bp[dx] = pos + this.gap
      bs[dw] = this.size[dw] - as[dw] - this.gap
    }
    else {
      const pos = this.size[dw] - vv - this.gap
      as[dw] = pos
      bp[dx] = pos + this.gap
      bs[dw] = vv
    }

    a.size = as
    b.size = bs
    a.point = ap
    b.point = bp
  }

}

export class PanedXA extends Paned {
  override dir = 'x' as const
  override vacuum = 'a' as const
}

export class PanedXB extends Paned {
  override dir = 'x' as const
  override vacuum = 'b' as const
}

export class PanedYA extends Paned {
  override dir = 'y' as const
  override vacuum = 'a' as const
}

export class PanedYB extends Paned {
  override dir = 'y' as const
  override vacuum = 'b' as const
}
