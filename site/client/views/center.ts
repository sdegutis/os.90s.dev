import { View } from "/client/views/view.js"

export class Center extends View {

  override layout(): void {
    for (const child of this.children) {
      child.point = {
        x: Math.floor(this.size.w / 2 - child.size.w / 2),
        y: Math.floor(this.size.h / 2 - child.size.h / 2),
      }
    }
  }

}
