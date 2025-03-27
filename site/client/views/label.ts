import type { DrawingContext } from "/client/core/drawing.js"
import { type Font } from "/client/core/font.js"
import { sys } from "/client/core/sys.js"
import { View } from "/client/views/view.js"

export class Label extends View {

  textColor: number = 0xffffffff
  font: Font = sys.font
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
