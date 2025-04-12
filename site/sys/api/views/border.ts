import { JsxAttrs } from "../core/jsx.js"
import { Margin } from "./margin.js"

export class Border extends Margin {

  constructor(config?: JsxAttrs<Border>) {
    super()
    this.setup(config)
  }

  override init(): void {
    super.init()
    this.$up.watch(() => this.adjust())
    this.$down.watch(() => this.adjust())
    this.$left.watch(() => this.adjust())
    this.$right.watch(() => this.adjust())
    this.adjust()
  }

  override adjust(): void {
    this.size = {
      w: this.left + (this.firstChild?.size.w ?? 0) + this.right,
      h: this.up + (this.firstChild?.size.h ?? 0) + this.down,
    }
  }

  override layout(): void {
    const c = this.firstChild
    if (c) {
      c.point = {
        x: this.left,
        y: this.up,
      }
    }
  }

}
