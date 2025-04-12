import { JsxAttrs } from "../core/jsx.js"
import { View } from "./view.js"

export class Center extends View {

  constructor(config?: JsxAttrs<Center>) {
    super()
    this.setup(config)
  }

  override layout(): void {
    for (const child of this.children) {
      child.point = {
        x: Math.floor(this.size.w / 2 - child.size.w / 2),
        y: Math.floor(this.size.h / 2 - child.size.h / 2),
      }
    }
  }

}
