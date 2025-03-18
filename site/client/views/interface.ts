export type MousePos = { x: number, y: number }

export interface View {

  x: number
  y: number
  w: number
  h: number

  background: number

  parent?: View
  children: View[]

  hovered: boolean
  visible: boolean
  passthrough: boolean

  mouse: MousePos

  onPanelFocus?(): void
  onPanelBlur?(): void

  onMouseDown?(button: number): void
  onMouseMove?(x: number, y: number): void
  onMouseUp?(): void
  onWheel?(n: number): void

  onMouseEnter?(): void
  onMouseExit?(): void

  canFocus: boolean
  onFocus?(): void
  onKeyDown?(key: string): void
  onBlur?(): void

  draw(
    ctx: OffscreenCanvasRenderingContext2D,
    px: number,
    py: number,
  ): void

}
