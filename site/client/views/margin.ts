import type { DrawingContext } from "../../shared/drawing.js"
import { View } from "./view.js"

export class Margin extends View {

  paddingColor: number = 0x00000000
  padding: number = 0

  override init(): void {
    this.$.padding.watch(() => {
      this.layout()
    })
    this.$.paddingColor.watch(() => this.needsRedraw())
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

  override draw(ctx: DrawingContext, px: number, py: number): void {
    super.draw(ctx, px, py)
    this.drawBorder(ctx, px, py, this.paddingColor)
  }

  protected drawBorder(ctx: DrawingContext, px: number, py: number, col: number) {
    for (let i = 0; i < this.padding; i++) {
      ctx.strokeRect(
        px + i,
        py + i,
        this.size.w - i * 2,
        this.size.h - i * 2,
        col,
      )
    }
  }

}
