import { makeRef } from "../core/ref.js"
import { JsxAttrs } from "../jsx.js"
import { View } from "./view.js"

export class Spaced extends View {

  constructor(config?: JsxAttrs<Spaced>) {
    super()
    this.setup(config)
  }

  override init(): void {
    super.init()

    this.$dir.watch(() => this.adjust())
    this.$size.watch(() => this.layout())
    this.adjust()
    this.layout()
  }

  dir: 'x' | 'y' = 'x'
  $dir = makeRef(this, 'dir')

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
    if (this.size.w === 0 || this.size.h === 0) return

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

export class SpacedX extends Spaced {
  constructor(config?: JsxAttrs<Spaced>) {
    super()
    this.dir = 'x'
    this.setup(config)
  }
}

export class SpacedY extends Spaced {
  constructor(config?: JsxAttrs<Spaced>) {
    super()
    this.dir = 'y'
    this.setup(config)
  }
}
