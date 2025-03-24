import { colorFor } from "../util/colors.js"
import { view } from "./view.js"

export class margin extends view {

  marginColor: number = 0x00000000
  padding: number = 0

  override init(): void {
    this.$$multiplex('padding', 'size').watch(() => {
      this.layout()
    })
    this.$$multiplex('marginColor').watch(() => this.needsRedraw())
    this.layout()
  }

  override layout(): void {
    const c = this.firstChild
    if (c) {
      c.point = {
        x: this.padding,
        y: this.padding,
      }
      c.size = {
        w: this.size.w - this.padding * 2,
        h: this.size.h - this.padding * 2,
      }
    }
  }

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    super.draw(ctx, px, py)
    this.drawBorder(ctx, px, py, colorFor(this.marginColor))
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
