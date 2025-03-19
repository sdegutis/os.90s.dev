import { view } from "./view.js"

export class group extends view {

  override adjustKeys = [...(this as view).adjustKeys, 'gap', 'dir', 'align']

  gap = 0
  dir: 'x' | 'y' = 'x'
  align: 'a' | 'm' | 'z' = 'm'

  override adjust(): void {
    const dw = this.dir === 'x' ? 'w' : 'h'
    const dh = this.dir === 'x' ? 'h' : 'w'
    const o = { w: this.w, h: this.h }

    o[dw] = o[dh] = 0
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      o[dw] += child[dw]
      if (i > 0) o[dw] += this.gap
      if (o[dh] < child[dh]) o[dh] = child[dh]
    }

    this.$update('w', o.w)
    this.$update('h', o.h)
  }

  override layout(): void {
    const dw = this.dir === 'x' ? 'w' : 'h'
    const dh = this.dir === 'x' ? 'h' : 'w'
    const dx = this.dir === 'x' ? 'x' : 'y'
    const dy = this.dir === 'x' ? 'y' : 'x'

    let x = 0
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      const o = { x: child.x, y: child.y }
      o[dx] = x
      x += child[dw] + this.gap
      o[dy] = this.align === 'm' ? Math.round((this[dh] - child[dh]) / 2) :
        this.align === 'a' ? 0 :
          this[dh] - child[dh]

      child.$update('x', o.x)
      child.$update('y', o.y)
    }
  }

}

export class groupx extends group {
  override dir = 'x' as const
}

export class groupy extends group {
  override dir = 'y' as const
}
