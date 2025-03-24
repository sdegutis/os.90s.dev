import type { Panel } from "../core/panel.js"
import { colorFor } from "../util/colors.js"
import { Dynamic } from "../util/dyn.js"
import { debounce } from "../util/throttle.js"
import { arrayEquals, pointEquals, sizeEquals, type Point, type Size } from "../util/types.js"

export class view extends Dynamic {

  panel: Panel | null = null

  parent: view | null = null
  children: readonly view[] = []

  get firstChild(): view | undefined { return this.children[0] }
  get lastChild(): view | undefined { return this.children[this.children.length - 1] }

  point: Point = { x: 0, y: 0 }
  size: Size = { w: 0, h: 0 }

  canFocus: boolean = false
  passthrough: boolean = true
  visible: boolean = true
  autofocus: boolean = false

  hovered: boolean = false
  pressed: boolean = false
  selected: boolean = false

  background: number = 0x00000000
  hoverBackground: number = 0x00000000
  pressBackground: number = 0x00000000
  selectedBackground: number = 0x00000000

  panelOffset: Point = { x: 0, y: 0 }

  get mouse(): Point {
    return {
      x: (this.panel?.absmouse.x ?? 0) - this.panelOffset.x - (this.panel?.point.x ?? 0),
      y: (this.panel?.absmouse.y ?? 0) - this.panelOffset.y - (this.panel?.point.y ?? 0),
    }
  }

  onPanelFocus?(): void
  onPanelBlur?(): void

  onMouseDown?(button: number, pos: Point): void
  onMouseMove?(pos: Point): void
  onMouseUp?(): void

  onMouseEnter?(): void
  onMouseExit?(): void

  onWheel?(x: number, y: number): void

  onFocus?(): void
  onBlur?(): void

  onKeyDown?(key: string): boolean
  onKeyUp?(key: string): void

  adjust?(): void
  layout?(): void

  adopted?(parent: view): void
  presented?(panel: Panel): void

  override init(): void {
    this.$$watch('parent', (parent) => {
      if (parent) this.adopted?.(parent)
    })

    this.$$watch('panel', (panel) => {
      if (panel) {
        this.presented?.(panel)
        if (this.autofocus) {
          this.focus()
        }
      }
    })

    this.$$watch('size', () => {
      this.layout?.()
      this.parent?.onChildResized()
      this.panel?.needsMouseCheck()
      this.needsRedraw()
    })

    this.$$watch('point', () => {
      this.panel?.needsMouseCheck()
      this.needsRedraw()
    })

    this.$$multiplex(
      'visible', 'hovered', 'pressed', 'selected',
      'background', 'hoverBackground', 'selectedBackground', 'pressBackground',
    ).watch(() => {
      this.needsRedraw()
    })

    this.$$watch('children', () => {
      for (const child of this.children) {
        child.parent = this
        child.adoptTree(this.panel)
      }
      this.adjust?.()
      this.layout?.()
      this.needsRedraw()
    })

    for (const child of this.children) {
      child.parent = this
      child.adoptTree(this.panel)
    }

    this.$$ref('children').equals = arrayEquals
    this.$$ref('point').equals = pointEquals
    this.$$ref('size').equals = sizeEquals
  }

  draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    this.drawBackground(ctx, px, py, colorFor(this.background))

    if (this.selected) {
      this.drawBackground(ctx, px, py, colorFor(this.selectedBackground))
    }
    else if (this.pressed) {
      this.drawBackground(ctx, px, py, colorFor(this.pressBackground))
    }
    else if (this.hovered) {
      this.drawBackground(ctx, px, py, colorFor(this.hoverBackground))
    }
  }

  protected drawBackground(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number, bg: string) {
    ctx.fillStyle = bg
    ctx.fillRect(px, py, this.size.w, this.size.h)
  }

  focus() {
    this.panel?.focusView(this)
  }

  adoptTree(panel: Panel | null) {
    this.panel = panel
    for (const child of this.children) {
      child.adoptTree(panel)
    }
  }

  private onChildResized = debounce(() => {
    this.adjust?.()
    this.layout?.()
  })

  protected needsRedraw() {
    this.panel?.needsRedraw()
  }

}
