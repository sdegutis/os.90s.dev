export class view {

  readonly children: view[] = []

  readonly adjustKeys = ['w', 'h']
  readonly redrawKeys = ['background']

  readonly x: number = 0
  readonly y: number = 0
  readonly w: number = 0
  readonly h: number = 0

  readonly canFocus: boolean = false
  readonly visible: boolean = true
  readonly hovered: boolean = false
  readonly passthrough: boolean = false
  readonly parent: view | null = null
  readonly mouse: {
    readonly x: number,
    readonly y: number,
  } = { x: 0, y: 0 }

  readonly background: string = '#000'

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

  draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    ctx.fillStyle = this.background
    ctx.fillRect(px, py, this.w, this.h)
  }

  update(k: keyof this, v: this[keyof this]) {
    this[k] = v
  }

}
