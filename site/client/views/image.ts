import type { Bitmap } from "../../shared/bitmap.js"
import { view } from "./view.js"

export class image extends view {

  bitmap: Bitmap | null = null

  override passthrough: boolean = true

  override init(): void {
    this.$multiplex('bitmap').watch(() => this.adjust())
  }

  override adjust(): void {
    this.size = {
      w: this.bitmap?.width ?? 0,
      h: this.bitmap?.height ?? 0,
    }
  }

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    super.draw(ctx, px, py)

    if (!this.bitmap) return
    ctx.drawImage(this.bitmap.canvas, px, py)
  }

}
