import type { DrawingContext } from "../core/drawing.js"
import { $ } from "../core/ref.js"
import { JsxAttrs } from "../jsx.js"
import { View } from "./view.js"

export class Margin extends View {

  constructor(config?: JsxAttrs<Margin>) {
    super()
    this.setup(config)
  }

  override init(): void {
    super.init()

    this.$paddingColor.watch(() => this.needsRedraw())

    this.$padding.watch(() => this.layout())
    this.layout()
  }

  $paddingColor = $<number>(0x00000000)
  get paddingColor() { return this.$paddingColor.val }
  set paddingColor(val) { this.$paddingColor.val = val }

  $padding = $<number>(0)
  get padding() { return this.$padding.val }
  set padding(val) { this.$padding.val = val }

  override layout(): void {
    if (this.size.w === 0 || this.size.h === 0) return

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
