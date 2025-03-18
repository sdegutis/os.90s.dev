import type { View } from "./interface.js"

interface IntrinsicView extends Omit<View, 'children'> {
  children?: JSX.Element[] | JSX.Element | undefined
}

export const drawBackground: IntrinsicView['draw'] = function (this: IntrinsicView, ctx, px, py) {
  ctx.fillStyle = '#' + this.background.toString(16).padStart(8, '0')
  ctx.fillRect(px, py, this.w, this.h)
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

export const drawBorderedView: IntrinsicView['draw'] = function (this: Border, ctx, px, py) {
  ctx.fillStyle = '#' + this.background.toString(16).padStart(8, '0')
  ctx.fillRect(
    px + this.padding,
    py + this.padding,
    this.w - this.padding * 2,
    this.h - this.padding * 2,
  )

  ctx.strokeStyle = '#' + this.borderColor.toString(16).padStart(8, '0')
  for (let i = 0; i < this.padding; i++) {
    ctx.strokeRect(px + i + .5, py + i + .5, this.w - i * 2 - 1, this.h - i * 2 - 1)
  }
}

type Border = ReturnType<typeof border>

function border() {
  return {
    ...view(),
    borderColor: 0x00000000,
    padding: 0,
    draw: drawBorderedView,
  }
}

export const primitives = {
  view,
  border,
} satisfies Record<string, () => IntrinsicView>
