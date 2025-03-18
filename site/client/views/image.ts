import type { Bitmap } from "../../shared/bitmap.js"
import { drawBackground, view, type IntrinsicView } from "./view.js"

export type Image = ReturnType<typeof image>

export function image() {
  return {
    ...view(),
    image: null as Bitmap | null,
    draw: drawImage,
  }
}

export const drawImage: IntrinsicView['draw'] = function (this: Image, ctx, px, py) {
  drawBackground.call(this, ctx, px, py)
  if (!this.image?.canvas) return
  ctx.drawImage(this.image.canvas, px, py)
}
