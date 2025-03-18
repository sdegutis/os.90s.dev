import type { View } from "./interface.js"

export interface IntrinsicView extends Omit<View, 'children'> {
  children?: JSX.Element[] | JSX.Element | undefined
}

export interface view extends IntrinsicView { }
export class view implements IntrinsicView {

  adjustKeys = ['w', 'h']
  redrawKeys = ['background']

  x = 0
  y = 0
  w = 0
  h = 0

  canFocus = false
  visible = true
  hovered = false
  passthrough = false
  parent = null
  mouse = { x: 0, y: 0 }

  background = '#000'

  draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    ctx.fillStyle = this.background
    ctx.fillRect(px, py, this.w, this.h)
  }

}
