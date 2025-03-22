import { colorFor } from "../util/colors.js"
import { view } from "./view.js"

export class border extends view {

  borderColor: number = 0x00000000
  padding: number = 0

  override passthrough: boolean = true

  override init(): void {
    this.$multiplex('padding').watch(() => {
      this.adjust()
      this.layout()
    })
    this.$multiplex('borderColor').watch(() => this.needsRedraw())
  }

  override adjust(): void {
    this.size = {
      w: this.padding + (this.firstChild?.size.w ?? 0) + this.padding,
      h: this.padding + (this.firstChild?.size.h ?? 0) + this.padding,
    }
  }

  override layout(): void {
    const c = this.firstChild
    if (c) {
      c.point = {
        x: this.padding,
        y: this.padding,
      }
    }
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
        this.size.w - i * 2 - 1,
        this.size.h - i * 2 - 1,
      )
    }
  }

}
