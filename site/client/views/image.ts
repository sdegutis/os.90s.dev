import type { Bitmap } from "../../shared/bitmap.js"
import { view } from "./view.js"

export class image extends view {

  readonly bitmap: Bitmap | null = null

  override init(): void {
    this.addAdjustKeys('bitmap')
  }

  override adjust(): void {
    const mutthis = this.mutable()
    mutthis.w = this.bitmap?.width ?? 0
    mutthis.h = this.bitmap?.height ?? 0
    mutthis.commit()
  }

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    super.draw(ctx, px, py)

    if (!this.bitmap) return
    ctx.drawImage(this.bitmap.canvas, px, py)
  }

}
