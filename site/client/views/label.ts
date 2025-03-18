import { crt2025 } from "../../shared/font.js"
import { view } from "./view.js"

export class label extends view {

  override adjustKeys = [...(this as view).adjustKeys, 'text', 'font']
  override redrawKeys = [...(this as view).redrawKeys, 'textColor']

  textColor = '#fff'
  font = crt2025
  text = ''

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    super.draw(ctx, px, py)
    this.font.print(ctx, px, py, this.textColor, this.text)
  }

}
