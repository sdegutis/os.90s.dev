import type { Panel } from "../core/panel.js"
import { Ref } from "../util/ref.js"

export class view {

  panel?: Panel

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

  adjust?(): void
  layout?(): void

  draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    ctx.fillStyle = this.background
    ctx.fillRect(px, py, this.w, this.h)
  }

  $update<K extends keyof this & string>(k: K, v: this[K]) {
    this[k] = v

    if (this.adjustKeys.includes(k)) {
      this.adjust?.()
      this.redraw()
    }
    else if (this.redrawKeys.includes(k)) {
      this.redraw()
    }
  }

  private redraw() {
    let node: view = this
    while (node.parent) node = node.parent
    node.panel?.needsRedraw()
  }

  $setup(data: Record<string, any>, children: view[]) {
    (this as any).children = children
    for (const child of this.children) {
      (child as any).parent = this
    }

    for (const [k, v] of Object.entries(data)) {
      if (v instanceof Ref) {
        (this as any)[k] = v.val
        v.watch(val => this.$update<any>(k, val))
      }
      else {
        (this as any)[k] = v
      }
    }
  }

}
