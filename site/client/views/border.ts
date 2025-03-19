import { view } from "./view.js"

export class border extends view {

  override adjustKeys = [...(this as view).adjustKeys, 'padding']
  override redrawKeys = [...(this as view).redrawKeys, 'borderColor']

  readonly borderColor: string = '#0000'
  readonly padding: number = 0

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

    ctx.strokeStyle = this.borderColor
    this.drawBorder(ctx, px, py)
  }

  protected drawBorder(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number) {
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
