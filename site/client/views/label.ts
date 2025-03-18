import { crt2025 } from "../../shared/font.js"
import { drawBackground, view, type IntrinsicView } from "./view.js"

export type Label = ReturnType<typeof label>

export function label() {
  const parent = view()

  return {
    ...parent,

    relayoutAndRedrawKeys: [...parent.relayoutAndRedrawKeys, 'text', 'font'],
    redrawOnlyKeys: [...parent.redrawOnlyKeys, 'textColor'],

    textColor: '#fff',
    font: crt2025,
    text: '',
    draw: drawLabelText,
  }
}

export const drawLabelText: IntrinsicView['draw'] = function (this: Label, ctx, px, py) {
  drawBackground.call(this, ctx, px, py)
  this.font.print(ctx, px, py, this.textColor, this.text)
}
