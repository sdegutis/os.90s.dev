import type { Bitmap } from "../core/bitmap.js"
import type { DrawingContext } from "../core/drawing.js"
import { JsxAttrs } from "../core/jsx.js"
import { makeRef } from "../core/ref.js"
import { View } from "./view.js"

export class ImageView extends View {

  constructor(config?: JsxAttrs<ImageView>) {
    super()
    this.setup(config)
  }

  override init(): void {
    super.init()

    this.$bitmap.watch(() => this.adjust())
    this.adjust()
  }

  bitmap: Bitmap | null = null
  $bitmap = makeRef(this, 'bitmap')

  override adjust(): void {
    this.size = {
      w: this.bitmap?.width ?? 0,
      h: this.bitmap?.height ?? 0,
    }
  }

  override draw(ctx: DrawingContext): void {
    super.draw(ctx)

    if (!this.bitmap) return
    ctx.drawImage(this.bitmap.canvas, 0, 0)
  }

}
