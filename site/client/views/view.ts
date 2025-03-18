import type { View } from "./interface.js"

export interface IntrinsicView extends Omit<View, 'children'> {
  children?: JSX.Element[] | JSX.Element | undefined
}

const drawBackground: IntrinsicView['draw'] = function (this: IntrinsicView, ctx, px, py) {
  ctx.fillStyle = '#' + this.background.toString(16).padStart(8, '0')
  ctx.fillRect(px, py, this.w, this.h)
}

export function view(): IntrinsicView {
  return {

    x: 0,
    y: 0,
    w: 0,
    h: 0,

    canFocus: false,
    visible: true,
    hovered: false,
    passthrough: false,
    parent: null,
    mouse: { x: 0, y: 0 },

    background: 0x00000000,
    draw: drawBackground,

  }
}
