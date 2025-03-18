import { crt2025 } from "../../shared/font.js"
import { drawBackground, view, type IntrinsicView } from "./view.js"

export class label extends view {

  override adjustKeys = [...(this as view).adjustKeys, 'text', 'font']
  override redrawKeys = [...(this as view).redrawKeys, 'textColor']

  textColor = '#fff'
  font = crt2025
  text = ''

  override draw = drawLabelText

}

export const drawLabelText: IntrinsicView['draw'] = function (this: label, ctx, px, py) {
  drawBackground.call(this, ctx, px, py)
  this.font.print(ctx, px, py, this.textColor, this.text)
}
