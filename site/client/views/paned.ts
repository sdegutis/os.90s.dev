import { view } from "./view.js"

export class paned extends view {

  override layoutKeys = [...(this as view).layoutKeys, 'gap', 'dir', 'vacuum']

  readonly gap: number = 0
  readonly dir: 'x' | 'y' = 'x'
  readonly vacuum: 'a' | 'b' = 'a'

  override onChildResized(): void {
    this.adjust?.()
    this.layoutTree()
  }

  override onNeedsLayout(): void {
    this.firstChild?.adjust?.()
    this.lastChild?.adjust?.()
  }

  override layout(): void {
    const a = this.children[0].mutable()
    const b = this.children[1].mutable()

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

    a.commit()
    b.commit()
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
