import { JsxAttrs } from "../core/jsx.js"
import { makeRef } from "../core/ref.js"
import type { Point } from "../core/types.js"
import { View } from "./view.js"

export class Grid extends View {

  constructor(config?: JsxAttrs<Grid>) {
    super()
    this.setup(config)
  }

  override init(): void {
    super.init()

    const fixall = () => {
      this.adjust()
      this.layout()
    }

    this.$cols.watch(fixall)
    this.$flow.watch(fixall)
    this.$xgap.watch(fixall)
    this.$ygap.watch(fixall)
    fixall()
  }

  cols = Infinity
  readonly $cols = makeRef(this, 'cols')

  flow = false
  readonly $flow = makeRef(this, 'flow')

  xgap = 0
  readonly $xgap = makeRef(this, 'xgap')

  ygap = 0
  readonly $ygap = makeRef(this, 'ygap')


  override adopted(parent: View): void {
    this.adjust()
  }

  override adjust(): void {
    if (this.cols === Infinity) return

    const { width, height } = this.buildGrid('adjust')
    this.size = { w: width, h: height }
  }

  override layout(): void {
    for (const [child, point] of this.buildGrid('layout').grid) {
      child.point = point
    }
  }

  private buildGrid(mode: 'adjust' | 'layout') {
    const grid = new Map<View, Point>()
    const maxw = mode === 'adjust' ? Infinity : this.size.w || Infinity

    let width = 0
    let height = 0

    let x = 0
    let y = 0
    let h = 0
    let col = 0

    for (const child of this.children) {
      if (col === this.cols || (this.flow && x + child.size.w > maxw)) {
        col = 0
        x = 0
        y += h + this.ygap
        h = 0
        height = y
      }

      grid.set(child, { x, y })

      child.point = { x, y }
      x += child.size.w + this.xgap
      width = Math.max(width, x - this.xgap)
      col++
      h = Math.max(h, child.size.h)
    }

    height += h
    return { grid, width, height }
  }

}
