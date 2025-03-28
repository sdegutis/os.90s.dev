import { JsxAttrs } from "../jsx.js"
import { Margin } from "./margin.js"

export class Border extends Margin {

  constructor(config?: JsxAttrs<Border>) { super() }

  override init(): void {
    this.$.padding.watch(() => {
      this.adjust()
    })
    this.adjust()
  }

  override adjust(): void {
    this.size = {
      w: this.padding + (this.firstChild?.size.w ?? 0) + this.padding,
      h: this.padding + (this.firstChild?.size.h ?? 0) + this.padding,
    }
    this.layout()
  }

  override layout(): void {
    const c = this.firstChild
    if (c) {
      c.point = {
        x: this.padding,
        y: this.padding,
      }
    }
  }

}
