import { view } from "./view.js"

export class spaced extends view {

  dir: 'x' | 'y' = 'x'

  override init(): void {
    // this.addAdjustKeys('dir')
  }

  override adjust(): void {
    const dh = this.dir === 'x' ? 'h' : 'w'
    // this[dh] = 0
    // for (let i = 0; i < this.children.length; i++) {
    //   const child = this.children[i]
    //   if (this[dh] < child[dh]) this[dh] = child[dh]
    // }
  }

  override layout(): void {
    // const max = this[this.dir === 'x' ? 'w' : 'h']
    // let combinedWidths = 0
    // for (let i = 0; i < this.children.length; i++) {
    //   combinedWidths += this.children[i].size.w
    // }
    // const gap = Math.floor((max - combinedWidths) / (this.children.length - 1))

    // const dw = this.dir === 'x' ? 'w' : 'h'
    // const dh = this.dir === 'x' ? 'h' : 'w'
    // const dx = this.dir === 'x' ? 'x' : 'y'
    // const dy = this.dir === 'x' ? 'y' : 'x'

    // let x = 0
    // for (let i = 0; i < this.children.length; i++) {
    //   // const child = this.children[i]
    //   // child[dx] = x
    //   // x += child[dw] + gap
    //   // child[dy] = Math.round((this[dh] - child[dh]) / 2)
    // }
  }

}

export class spacedx extends spaced {
  override dir = 'x' as const
}

export class spacedy extends spaced {
  override dir = 'y' as const
}
