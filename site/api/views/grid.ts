import { $ } from "../core/ref.js"
import type { Point } from "../core/types.js"
import { JsxAttrs } from "../jsx.js"
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

  $cols = $(Infinity)
  get cols() { return this.$cols.val }
  set cols(val) { this.$cols.val = val }

  $flow = $(false)
  get flow() { return this.$flow.val }
  set flow(val) { this.$flow.val = val }

  $xgap = $(0)
  get xgap() { return this.$xgap.val }
  set xgap(val) { this.$xgap.val = val }

  $ygap = $(0)
  get ygap() { return this.$ygap.val }
  set ygap(val) { this.$ygap.val = val }

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
