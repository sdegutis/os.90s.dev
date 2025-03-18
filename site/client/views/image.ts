import type { Bitmap } from "../../shared/bitmap.js"
import { view } from "./view.js"

export class image extends view {

  override adjustKeys = [...(this as view).adjustKeys, 'image']

  image: Bitmap | null = null

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    super.draw(ctx, px, py)

    if (!this.image) return
    ctx.drawImage(this.image.canvas, px, py)
  }

}
