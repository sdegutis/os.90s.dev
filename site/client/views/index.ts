import type { View } from "../../@imlib/jsx-browser.js"

interface IntrinsicView extends Omit<View, 'children'> {
  children?: JSX.Element[] | JSX.Element | undefined
}

function drawBackground(this: IntrinsicView) {

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

export const primitives: Record<string, () => IntrinsicView> = {
  view,
  border,
}  
