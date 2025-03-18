import { Ref } from "../util/ref.js"

export class view {

  readonly children: readonly view[] = []
  readonly parent: view | null = null

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

  $update(k: keyof this, v: this[keyof this]) {
    this[k] = v
  }

  $setup(data: Record<string, any>, children: view[]) {
    const view = (this as any)

    view.children = children
    for (const child of this.children) {
      (child as any).parent = this
    }

    for (const [k, v] of Object.entries(data)) {
      if (v instanceof Ref) {
        view[k] = v.val
        v.watch(val => this.$update(k as keyof this, val))
      }
      else {
        view[k] = v
      }
    }
  }

}
