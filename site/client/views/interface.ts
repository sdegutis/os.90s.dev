export type Pos = {
  readonly x: number,
  readonly y: number,
}

export interface View {

  relayoutAndRedrawKeys: string[]
  redrawOnlyKeys: string[]

  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number

  readonly background: string

  parent: View | null
  children: View[]

  readonly hovered: boolean
  readonly visible: boolean
  readonly passthrough: boolean
  readonly canFocus: boolean

  readonly mouse: {
    readonly x: number,
    readonly y: number,
  }

  onPanelFocus?(): void
  onPanelBlur?(): void

  onMouseDown?(button: number): void
  onMouseMove?(x: number, y: number): void
  onMouseUp?(): void
  onWheel?(x: number, y: number): void

  onMouseEnter?(): void
  onMouseExit?(): void

  onFocus?(): void
  onKeyDown?(key: string): void
  onBlur?(): void

  draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void

}
