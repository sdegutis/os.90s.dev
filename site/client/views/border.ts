import { view, type IntrinsicView } from "./view.js"

export class border extends view {

  override adjustKeys = [...(this as view).adjustKeys, 'padding']
  override redrawKeys = [...(this as view).redrawKeys, 'borderColor']

  borderColor = '#000'
  padding = 0

  override draw = drawBorderedView

}

export const drawBorderedView: IntrinsicView['draw'] = function (this: border, ctx, px, py) {
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
