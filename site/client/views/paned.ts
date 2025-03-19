import { view } from "./view.js"

export class paned extends view {

  override layoutKeys = [...(this as view).layoutKeys, 'gap', 'dir', 'vacuum']

  gap = 0
  dir: 'x' | 'y' = 'x'
  vacuum: 'a' | 'b' = 'a'

  override onChildResized(): void {
    this.adjust?.()
    this.layoutTree()
  }

  override onNeedsLayout(): void {
    this.firstChild?.adjust?.()
    this.lastChild?.adjust?.()
  }

  override layout(): void {
    const a = { ...this.children[0] }
    const b = { ...this.children[1] }

    const favored = ({ a, b })[this.vacuum]

    const dx = this.dir
    const dw = dx === 'x' ? 'w' : 'h'
    const vv = favored[dw]

    a.x = b.x = 0
    a.y = b.y = 0
    a.w = b.w = this.w
    a.h = b.h = this.h

    if (this.vacuum === 'a') {
      const pos = vv
      a[dw] = pos
      b[dx] = pos + this.gap
      b[dw] = this[dw] - a[dw] - this.gap
    }
    else {
      const pos = this[dw] - vv - this.gap
      a[dw] = pos
      b[dx] = pos + this.gap
      b[dw] = vv
    }

    this.children[0].$update('x', a.x)
    this.children[0].$update('y', a.y)
    this.children[0].$update('w', a.w)
    this.children[0].$update('h', a.h)
    this.children[1].$update('x', b.x)
    this.children[1].$update('y', b.y)
    this.children[1].$update('w', b.w)
    this.children[1].$update('h', b.h)
  }

}

export class panedxa extends paned {
  override dir = 'x' as const
  override vacuum = 'a' as const
}

export class panedxb extends paned {
  override dir = 'x' as const
  override vacuum = 'b' as const
}

export class panedya extends paned {
  override dir = 'y' as const
  override vacuum = 'a' as const
}

export class panedyb extends paned {
  override dir = 'y' as const
  override vacuum = 'b' as const
}
