import type { View } from "./interface.js"

interface IntrinsicView extends Omit<View, 'children'> {
  children?: JSX.Element[] | JSX.Element | undefined
}

const drawBackground: IntrinsicView['draw'] = function (this: IntrinsicView, ctx, x, y, w, h) {
  ctx.fillStyle = '#' + this.background.toString(16).padStart(8, '0')
  ctx.fillRect(x, y, w, h)
}

function view(): IntrinsicView {
  return {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    background: 0x00000000,
    draw: drawBackground,
  }
}

function border() {
  return {
    ...view(),
    padding: 0,
  }
}

export const primitives = {
  view,
  border,
} satisfies Record<string, () => IntrinsicView>
