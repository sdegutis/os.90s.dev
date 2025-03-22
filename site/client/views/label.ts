import { crt2025, Font } from "../../shared/font.js"
import { View } from "./view.js"

export class Label extends View {

  override passthrough: boolean = true

  textColor: number = 0xffffffff
  font: Font = crt2025
  text: string = ''

  override init(): void {
    this.$multiplex('text', 'font').watch(() => this.adjust())
    this.$multiplex('text', 'font', 'textColor').watch(() => this.needsRedraw())
  }

  override adjust() {
    this.size = this.font.calcSize(this.text)
  }

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    super.draw(ctx, px, py)
    this.font.print(ctx, px, py, this.textColor, this.text)
  }

}
