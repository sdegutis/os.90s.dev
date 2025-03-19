import { view } from "./view.js"

export class border extends view {

  override adjustKeys = [...(this as view).adjustKeys, 'padding']
  override redrawKeys = [...(this as view).redrawKeys, 'borderColor']

  borderColor = '#000'
  padding = 0

  override adjust(): void {
    this.$update('w', this.padding + (this.firstChild?.w ?? 0) + this.padding)
    this.$update('h', this.padding + (this.firstChild?.h ?? 0) + this.padding)
  }

  override layout(): void {
    const c = this.firstChild
    if (c) {
      c.$update('x', this.padding)
      c.$update('y', this.padding)
    }
  }

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    ctx.fillStyle = this.background
    ctx.fillRect(
      px + this.padding,
      py + this.padding,
      this.w - this.padding * 2,
      this.h - this.padding * 2,
    )

    ctx.strokeStyle = this.borderColor
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
