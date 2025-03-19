import { crt2025 } from "../../shared/font.js"
import { colorFor, view } from "./view.js"

export class label extends view {

  override adjustKeys = [...(this as view).adjustKeys, 'text', 'font']
  override redrawKeys = [...(this as view).redrawKeys, 'textColor']

  override passthrough: boolean = true

  textColor = 0xffffffff
  font = crt2025
  text = ''

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    super.draw(ctx, px, py)
    this.font.print(ctx, px, py, colorFor(this.textColor), this.text)
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
