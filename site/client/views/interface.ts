export interface View {

  x: number
  y: number
  w: number
  h: number

  background: number

  parent?: View
  children: View[]

  onMouseDown?(button: number): void

  draw(
    ctx: OffscreenCanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void

}
