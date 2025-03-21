import { crt2025, Font } from "../../shared/font.js"
import { view } from "./view.js"

export class label extends view {

  override passthrough: boolean = true

  textColor: number = 0xffffffff
  font: Font = crt2025
  text: string = ''

  override init(): void {
    this.addAdjustKeys('text', 'font')
    this.addRedrawKeys('textColor')
  }

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    super.draw(ctx, px, py)
    this.font.print(ctx, px, py, this.textColor, this.text)
  }

  override adjust(): void {
    let w = 0
    const lines = this.text.split('\n')
    for (const line of lines) {
      if (line.length > w) w = line.length
    }
    const mutthis = this.mutable()
    mutthis.w = w * this.font.cw + (w - 1) * this.font.xgap
    mutthis.h = (lines.length * this.font.ch) + ((lines.length - 1) * this.font.ygap)
    mutthis.commit()
  }

}
