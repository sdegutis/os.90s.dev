import { view } from "./view.js"

export class group extends view {

  gap: number = 0
  dir: 'x' | 'y' = 'x'
  align: 'a' | 'm' | 'z' = 'm'

  override passthrough: boolean = true

  override init(): void {
    // this.addAdjustKeys('gap', 'dir', 'align', 'children')
    // this.addLayoutKeys()
  }

  // override adjust(): void {
  //   const dw = this.dir === 'x' ? 'w' : 'h'
  //   const dh = this.dir === 'x' ? 'h' : 'w'

  //   // this[dw] = this[dh] = 0
  //   // for (let i = 0; i < this.children.length; i++) {
  //   //   const child = this.children[i]
  //   //   this[dw] += child[dw]
  //   //   if (i > 0) this[dw] += this.gap
  //   //   if (this[dh] < child[dh]) this[dh] = child[dh]
  //   // }
  // }

  // override layout(): void {
  //   const dw = this.dir === 'x' ? 'w' : 'h'
  //   const dh = this.dir === 'x' ? 'h' : 'w'
  //   const dx = this.dir === 'x' ? 'x' : 'y'
  //   const dy = this.dir === 'x' ? 'y' : 'x'

  //   let x = 0
  //   for (let i = 0; i < this.children.length; i++) {
  //     const child = this.children[i]
  //     const point = { ...child.point }

  //     // point[dx] = x
  //     // x += child[dw] + this.gap
  //     // point[dy] = this.align === 'm' ? Math.round((this[dh] - child[dh]) / 2) :
  //     //   this.align === 'a' ? 0 :
  //     //     this[dh] - child[dh]

  //     child.point = point
  //   }
  // }

}

export class groupx extends group {
  override dir = 'x' as const
}

export class groupy extends group {
  override dir = 'y' as const
}
