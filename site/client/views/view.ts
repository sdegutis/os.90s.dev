import type { DrawingContext } from "../core/drawing.js"
import type { Panel } from "../core/panel.js"
import { multiplex } from "../core/ref.js"
import { type Point, type Size, arrayEquals, pointEquals, sizeEquals } from "../core/types.js"
import { JsxAttrs } from "../jsx.js"
import { Dynamic } from "../util/dyn.js"
import { debounce } from "../util/throttle.js"

export class View extends Dynamic {

  constructor(config?: JsxAttrs<View>) { super() }

  panel: Panel | null = null

  parent: View | null = null
  children: readonly View[] = []

  point: Point = { x: 0, y: 0 }
  size: Size = { w: 0, h: 0 }

  canFocus: boolean = false
  canMouse: boolean = false
  visible: boolean = true
  autofocus: boolean = false

  hovered: boolean = false
  pressed: boolean = false
  selected: boolean = false

  background: number = 0x00000000

  panelOffset: Point = { x: 0, y: 0 }
  mouse: Point = { x: 0, y: 0 }

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
        multiplex([this.$.panelOffset, panel.$mouse], () => {
          this.mouse = {
            x: panel.mouse.x - this.panelOffset.x,
            y: panel.mouse.y - this.panelOffset.y,
          }
        })

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

  draw(ctx: DrawingContext, px: number, py: number): void {
    this.drawBackground(ctx, px, py, this.background)
  }

  protected childResized = debounce(() => {
    this.adjust?.()
    this.layout?.()
  })

  protected drawBackground(ctx: DrawingContext, px: number, py: number, bg: number) {
    ctx.fillRect(px, py, this.size.w, this.size.h, bg)
  }

  focus() {
    this.panel?.focusView(this)
  }

  needsRedraw() {
    this.panel?.needsRedraw()
  }

  get firstChild(): View | undefined { return this.children[0] }
  get lastChild(): View | undefined { return this.children[this.children.length - 1] }

}
