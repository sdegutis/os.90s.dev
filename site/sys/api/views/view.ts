import type { DrawingContext } from "../core/drawing.js"
import type { Panel } from "../core/panel.js"
import { $$, multiplex } from "../core/ref.js"
import { type Point, type Size, arrayEquals, pointEquals, sizeEquals } from "../core/types.js"
import { JsxAttrs } from "../jsx.js"
import { debounce } from "../util/throttle.js"

export class View {

  constructor(config?: JsxAttrs<View>) {
    this.setup(config)
  }

  protected setup<T extends View>(config?: JsxAttrs<T>) {
    if (!config) return

    const c = config as JsxAttrs<View>
    if ('children' in c) {
      if (!(c.children instanceof Array)) {
        c.children = [c.children]
      }
    }

    Object.assign(this, config)

    this.init()
  }

  init() {
    this.$parent.watch((parent) => {
      if (parent) this.adopted?.(parent)
    })

    this.$panel.watch((panel) => {
      if (panel) {
        multiplex([this.$panelOffset, panel.$mouse], () => {
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

    this.$size.watch(() => {
      this.layout?.()
      this.parent?.childResized()
      this.panel?.needsMouseCheck()
      this.needsRedraw()
    })

    this.$point.watch(() => {
      this.panel?.needsMouseCheck()
      this.needsRedraw()
    })

    this.$visible.watch(() => this.needsRedraw())
    this.$hovered.watch(() => this.needsRedraw())
    this.$pressed.watch(() => this.needsRedraw())
    this.$selected.watch(() => this.needsRedraw())
    this.$background.watch(() => this.needsRedraw())

    this.$children.watch(() => {
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

    this.$children.equals = arrayEquals
    this.$point.equals = pointEquals
    this.$size.equals = sizeEquals
  }

  panel: Panel | null = null; $panel = $$(this, 'panel')
  parent: View | null = null; $parent = $$(this, 'parent')

  children: View[] = []
  $children = $$(this, 'children')

  point: Point = { x: 0, y: 0 }
  $point = $$(this, 'point')

  size: Size = { w: 0, h: 0 }
  $size = $$(this, 'size')

  canFocus = false; $canFocus = $$(this, 'canFocus')
  canMouse = false; $canMouse = $$(this, 'canMouse')
  visible = true; $visible = $$(this, 'visible')
  autofocus = false; $autofocus = $$(this, 'autofocus')

  hovered = false; $hovered = $$(this, 'hovered')
  pressed = false; $pressed = $$(this, 'pressed')
  selected = false; $selected = $$(this, 'selected')


  background = 0x00000000
  $background = $$(this, 'background')

  panelOffset: Point = { x: 0, y: 0 }
  $panelOffset = $$(this, 'panelOffset')

  mouse: Point = { x: 0, y: 0 }
  $mouse = $$(this, 'mouse')


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

  draw(ctx: DrawingContext): void {
    this.drawBackground(ctx, this.background)
  }

  protected childResized = debounce(() => {
    this.adjust?.()
    this.layout?.()
  })

  protected drawBackground(ctx: DrawingContext, bg: number) {
    ctx.fillRect(0, 0, this.size.w, this.size.h, bg)
  }

  focus() {
    this.panel?.focusView(this)
  }

  needsRedraw() {
    this.panel?.needsRedraw()
  }

  get firstChild(): View | undefined { return this.children[0] }
  get lastChild(): View | undefined { return this.children[this.children.length - 1] }

  get screenPoint() {
    return {
      x: this.panel!.point.x + this.panelOffset.x + this.point.x,
      y: this.panel!.point.y + this.panelOffset.y + this.point.y,
    }
  }

}
