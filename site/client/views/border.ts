import { view, type IntrinsicView } from "./view.js"

export type Border = ReturnType<typeof border>

export function border() {
  return {
    ...view(),
    borderColor: '#000',
    padding: 0,
    draw: drawBorderedView,
  }
}

export const drawBorderedView: IntrinsicView['draw'] = function (this: Border, ctx, px, py) {
  ctx.fillStyle = this.background
  ctx.fillRect(
    px + this.padding,
    py + this.padding,
    this.w - this.padding * 2,
    this.h - this.padding * 2,
  )

  ctx.strokeStyle = this.borderColor
  for (let i = 0; i < this.padding; i++) {
    ctx.strokeRect(px + i + .5, py + i + .5, this.w - i * 2 - 1, this.h - i * 2 - 1)
  }
}
