import type { Bitmap } from "../../shared/bitmap.js"
import type { DrawingContext } from "../util/drawing.js"
import { View } from "./view.js"

export class ImageView extends View {

  bitmap: Bitmap | null = null

  override init(): void {
    this.$.bitmap.watch(() => this.adjust())
    this.adjust()
  }

  override adjust(): void {
    this.size = {
      w: this.bitmap?.width ?? 0,
      h: this.bitmap?.height ?? 0,
    }
  }

  override draw(ctx: DrawingContext, px: number, py: number): void {
    super.draw(ctx, px, py)

    if (!this.bitmap) return
    ctx.drawImage(this.bitmap.canvas, px, py)
  }

}
