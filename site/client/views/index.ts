import type { View } from "../../@imlib/jsx-browser.js"

type WithJsx<T> = Omit<T, 'children'>

interface IntrinsicView extends WithJsx<View> {
  x: number
  y: number
  w: number
  h: number
  background: number
  children?: JSX.Element[] | JSX.Element | undefined
  onMouseDown?(button: number): void
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
    children: undefined,
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
}
