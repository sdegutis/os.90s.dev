import { $ } from "../core/ref.js"
import { JsxAttrs } from "../jsx.js"
import { debounce } from "../util/throttle.js"
import { View } from "./view.js"

export class Paned extends View {

  constructor(config?: JsxAttrs<Paned>) {
    super()
    this.setup(config)
  }

  override init(): void {
    super.init()

    const relayout = debounce(() => {
      this.children.forEach(c => c.adjust?.())
      this.needsRedraw()
      this.layout()
    })

    this.$gap.watch(relayout)
    this.$dir.watch(relayout)
    this.$vacuum.watch(relayout)

    this.layout()
  }

  $gap = $<number>(0)
  get gap() { return this.$gap.val }
  set gap(val) { this.$gap.val = val }

  $dir = $<'x' | 'y'>('x')
  get dir() { return this.$dir.val }
  set dir(val) { this.$dir.val = val }

  $vacuum = $<'a' | 'b'>('a')
  get vacuum() { return this.$vacuum.val }
  set vacuum(val) { this.$vacuum.val = val }

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
  constructor(config?: JsxAttrs<Paned>) {
    super()
    this.dir = 'x'
    this.vacuum = 'a'
    this.setup(config)
  }
}

export class PanedXB extends Paned {
  constructor(config?: JsxAttrs<Paned>) {
    super()
    this.dir = 'x'
    this.vacuum = 'b'
    this.setup(config)
  }
}

export class PanedYA extends Paned {
  constructor(config?: JsxAttrs<Paned>) {
    super()
    this.dir = 'y'
    this.vacuum = 'a'
    this.setup(config)
  }
}

export class PanedYB extends Paned {
  constructor(config?: JsxAttrs<Paned>) {
    super()
    this.dir = 'y'
    this.vacuum = 'b'
    this.setup(config)
  }
}
