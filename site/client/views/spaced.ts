import { view } from "./view.js"

export class spaced extends view {

  dir: 'x' | 'y' = 'x'

  override init(): void {
    this.$multiplex('dir').watch(() => this.adjust())
    this.$multiplex('size').watch(() => this.layout())
  }

  override adjust(): void {
    const dh = this.dir === 'x' ? 'h' : 'w'
    const size = { ...this.size }
    size[dh] = 0
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      if (size[dh] < child.size[dh]) size[dh] = child.size[dh]
    }
    this.size = size
  }

  override layout(): void {
    const max = this.size[this.dir === 'x' ? 'w' : 'h']
    let combinedWidths = 0
    for (let i = 0; i < this.children.length; i++) {
      combinedWidths += this.children[i].size.w
    }
    const gap = Math.floor((max - combinedWidths) / (this.children.length - 1))

    const dw = this.dir === 'x' ? 'w' : 'h'
    const dh = this.dir === 'x' ? 'h' : 'w'
    const dx = this.dir === 'x' ? 'x' : 'y'
    const dy = this.dir === 'x' ? 'y' : 'x'

    let x = 0
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      const size = { ...child.size }
      const point = { ...child.point }
      point[dx] = x
      x += size[dw] + gap
      point[dy] = Math.round((this.size[dh] - size[dh]) / 2)
      child.point = point
      child.size = size
    }
  }

}

export class spacedx extends spaced {
  override dir = 'x' as const
}

export class spacedy extends spaced {
  override dir = 'y' as const
}
