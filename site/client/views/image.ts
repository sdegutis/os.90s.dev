import type { Bitmap } from "../../shared/bitmap.js"
import { drawBackground, view, type IntrinsicView } from "./view.js"

export class image extends view {

  override adjustKeys = [...(this as view).adjustKeys, 'image']

  image: Bitmap | null = null

  override draw = drawImage

}

export const drawImage: IntrinsicView['draw'] = function (this: image, ctx, px, py) {
  drawBackground.call(this, ctx, px, py)

  if (!this.image) return
  ctx.drawImage(this.image.canvas, px, py)
}
