import { Margin } from "./margin.js"

export class Border extends Margin {

  override init(): void {
    this.$$multiplex('padding').watch(() => {
      this.adjust()
      this.layout()
    })
    this.$$multiplex('paddingColor').watch(() => this.needsRedraw())
    this.adjust()
    this.layout()
  }

  override adjust(): void {
    this.size = {
      w: this.padding + (this.firstChild?.size.w ?? 0) + this.padding,
      h: this.padding + (this.firstChild?.size.h ?? 0) + this.padding,
    }
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
