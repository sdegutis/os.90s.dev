import type { Panel } from "../core/panel.js"
import { colorFor } from "../util/colors.js"
import { Dynamic } from "../util/dyn.js"
import { arrayEquals, pointEquals, sizeEquals, type Point, type Size } from "../util/types.js"

export class View extends Dynamic {

  panel: Panel | null = null

  parent: View | null = null
  children: readonly View[] = []

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

  onMouseDown?(button: number): void
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

  adopted?(parent: View): void
  presented?(panel: Panel): void

  override init(): void {
    this.$.parent.watch((parent) => {
      if (parent) this.adopted?.(parent)
    })

    this.$.panel.watch((panel) => {
      if (panel) {
        this.presented?.(panel)
        if (this.autofocus) {
          this.focus()
        }
      }
    })

    this.$.size.watch(() => {
      this.layout?.()
      this.parent?.childResized()
      this.panel?.needsMouseCheck()
      this.needsRedraw()
    })

    this.$.point.watch(() => {
      this.panel?.needsMouseCheck()
      this.needsRedraw()
    })

    this.$.visible.watch(() => this.needsRedraw())
    this.$.hovered.watch(() => this.needsRedraw())
    this.$.pressed.watch(() => this.needsRedraw())
    this.$.selected.watch(() => this.needsRedraw())
    this.$.background.watch(() => this.needsRedraw())
    this.$.hoverBackground.watch(() => this.needsRedraw())
    this.$.selectedBackground.watch(() => this.needsRedraw())
    this.$.pressBackground.watch(() => this.needsRedraw())

    this.$.children.watch(() => {
      for (const child of this.children) {
        child.parent = this
        this.panel?.adoptTree(child)
      }
      this.adjust?.()
      this.layout?.()
      this.needsRedraw()
    })

    for (const child of this.children) {
      child.parent = this
      this.panel?.adoptTree(child)
    }

    this.$.children.equals = arrayEquals
    this.$.point.equals = pointEquals
    this.$.size.equals = sizeEquals
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

  protected childResized() {
    this.adjust?.()
    this.layout?.()
  }

  protected drawBackground(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number, bg: string) {
    ctx.fillStyle = bg
    ctx.fillRect(px, py, this.size.w, this.size.h)
  }

  focus() {
    this.panel?.focusView(this)
  }

  protected needsRedraw() {
    this.panel?.needsRedraw()
  }

  get firstChild(): View | undefined { return this.children[0] }
  get lastChild(): View | undefined { return this.children[this.children.length - 1] }

}
