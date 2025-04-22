import { JsxAttrs } from "../core/jsx.js"
import { makeRef } from "../core/ref.js"
import type { Size } from "../core/types.js"
import { View } from "./view.js"

export class Group extends View {

  constructor(config?: JsxAttrs<Group>) {
    super()
    this.setup(config)
  }

  override init(): void {
    super.init()

    this.$gap.watch(() => this.adjust())
    this.$dir.watch(() => this.adjust())
    this.$align.watch(() => this.adjust())
    this.$children.watch(() => this.adjust())
    this.$children.watch(() => this.layout())
    this.adjust()
    // this.layout()
  }

  gap = 0
  readonly $gap = makeRef(this, 'gap')

  dir: 'x' | 'y' = 'x'
  readonly $dir = makeRef(this, 'dir')

  align: 'a' | 'm' | 'z' | '+' = 'm'
  readonly $align = makeRef(this, 'align')


  override adjust(): void {
    const dw = this.dir === 'x' ? 'w' : 'h'
    const dh = this.dir === 'x' ? 'h' : 'w'

    const size = { ...this.size }

    size[dw] = size[dh] = 0
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i].size
      size[dw] += child[dw]
      if (i > 0) size[dw] += this.gap
      if (size[dh] < child[dh]) size[dh] = child[dh]
    }

    this.size = size
  }

  override layout(): void {
    const dw = this.dir === 'x' ? 'w' : 'h'
    const dh = this.dir === 'x' ? 'h' : 'w'
    const dx = this.dir === 'x' ? 'x' : 'y'
    const dy = this.dir === 'x' ? 'y' : 'x'

    let x = 0
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      const point = { ...child.point }

      point[dx] = x
      x += child.size[dw] + this.gap
      point[dy] = this.align === 'm' ? Math.round((this.size[dh] - child.size[dh]) / 2) :
        (this.align === 'a' || this.align === '+') ? 0 :
          this.size[dh] - child.size[dh]

      if (this.align === '+') {
        child.size = { [dw]: child.size[dw], [dh]: this.size[dh] } as Size
      }

      child.point = point
    }
  }

}

export class GroupX extends Group {
  constructor(config?: JsxAttrs<Group>) {
    super()
    this.dir = 'x'
    this.setup(config)
  }
}

export class GroupY extends Group {
  constructor(config?: JsxAttrs<Group>) {
    super()
    this.dir = 'y'
    this.setup(config)
  }
}

export class GroupXA extends Group {
  constructor(config?: JsxAttrs<Group>) {
    super()
    this.dir = 'x'
    this.align = 'a'
    this.setup(config)
  }
}

export class GroupXZ extends Group {
  constructor(config?: JsxAttrs<Group>) {
    super()
    this.dir = 'x'
    this.align = 'z'
    this.setup(config)
  }
}

export class GroupYA extends Group {
  constructor(config?: JsxAttrs<Group>) {
    super()
    this.dir = 'y'
    this.align = 'a'
    this.setup(config)
  }
}

export class GroupYZ extends Group {
  constructor(config?: JsxAttrs<Group>) {
    super()
    this.dir = 'y'
    this.align = 'z'
    this.setup(config)
  }
}
