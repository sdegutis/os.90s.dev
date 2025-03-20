import { colorFor } from "../util/colors.js"
import { view } from "./view.js"

export class border extends view {

  readonly borderColor: number = 0x00000000
  readonly padding: number = 0

  override passthrough: boolean = true

  override init(): void {
    this.addAdjustKeys('padding')
    this.addRedrawKeys('borderColor')
  }

  override adjust(): void {
    const mutthis = this.mutable()
    mutthis.w = this.padding + (this.firstChild?.w ?? 0) + this.padding
    mutthis.h = this.padding + (this.firstChild?.h ?? 0) + this.padding
    mutthis.commit()
  }

  override layout(): void {
    this.firstChild?.mutate(c => {
      c.x = this.padding
      c.y = this.padding
    })
  }

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    super.draw(ctx, px, py)
    this.drawBorder(ctx, px, py, colorFor(this.borderColor))
  }

  protected drawBorder(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number, col: string) {
    ctx.strokeStyle = col
    for (let i = 0; i < this.padding; i++) {
      ctx.strokeRect(
        px + i + .5,
        py + i + .5,
        this.w - i * 2 - 1,
        this.h - i * 2 - 1,
      )
    }
  }

}
