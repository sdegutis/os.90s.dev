import type { Point } from "../util/types.js"
import { View } from "./view.js"

export class Grid extends View {

  cols = Infinity
  flow = false
  xgap = 0
  ygap = 0

  override init(): void {
    this.adjust()
    this.layout()
  }

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
        height = y - this.ygap
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
