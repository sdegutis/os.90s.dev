import { View } from "./view.js"

export class Grid extends View {

  cols = 0
  rows = 0
  xgap = 0
  ygap = 0

  override init(): void {
    this.adjust()
    this.layout()
  }

  override adjust(): void {
    if (this.cols === 0 && this.rows === 0) {
      if (this.parent) this.size = this.parent.size
      return
    }

    console.log(this.children)
  }

  override layout(): void {
    for (const child of this.children) {
      // child.point = {
      //   x: Math.floor(this.size.w / 2 - child.size.w / 2),
      //   y: Math.floor(this.size.h / 2 - child.size.h / 2),
      // }
    }
  }

}
