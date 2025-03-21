import { view } from "./view.js"

export class paned extends view {

  gap: number = 0
  dir: 'x' | 'y' = 'x'
  vacuum: 'a' | 'b' = 'a'

  override passthrough: boolean = true

  override init(): void {
    this.addLayoutKeys('gap', 'dir', 'vacuum', 'children')
    this.addAdjustKeys('children')
  }

  override onChildResized(): void {
    this.adjust?.()
    this.layoutTree()
  }

  override layout(): void {
    const a = this.children[0]
    const b = this.children[1]

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
