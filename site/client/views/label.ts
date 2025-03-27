import { DrawingContext } from "../core/drawing.js"
import { Font, crt34 } from "../core/font.js"
import { View } from "/client/views/view.js"

export class Label extends View {

  textColor: number = 0xffffffff
  font: Font = crt34
  text: string = ''

  override init(): void {
    this.$.text.watch(() => { this.adjust(); this.needsRedraw() })
    this.$.font.watch(() => { this.adjust(); this.needsRedraw() })
    this.$.textColor.watch(() => this.needsRedraw())
    this.adjust()
  }

  override adjust() {
    this.size = this.font.calcSize(this.text)
  }

  override draw(ctx: DrawingContext, px: number, py: number): void {
    super.draw(ctx, px, py)
    this.font.print(ctx, px, py, this.textColor, this.text)
  }

}
