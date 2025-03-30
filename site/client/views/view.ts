import type { DrawingContext } from "../core/drawing.js"
import type { Panel } from "../core/panel.js"
import { $, multiplex } from "../core/ref.js"
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

  $panel = $<Panel | null>(null)
  get panel() { return this.$panel.val }
  set panel(val) { this.$panel.val = val }


  $parent = $<View | null>(null)
  get parent() { return this.$parent.val }
  set parent(val) { this.$parent.val = val }

  $children = $<View[]>([])
  get children() { return this.$children.val }
  set children(val) { this.$children.val = val }


  $point = $<Point>({ x: 0, y: 0 })
  get point() { return this.$point.val }
  set point(val) { this.$point.val = val }

  $size = $<Size>({ w: 0, h: 0 })
  get size() { return this.$size.val }
  set size(val) { this.$size.val = val }


  $canFocus = $<boolean>(false)
  get canFocus() { return this.$canFocus.val }
  set canFocus(val) { this.$canFocus.val = val }

  $canMouse = $<boolean>(false)
  get canMouse() { return this.$canMouse.val }
  set canMouse(val) { this.$canMouse.val = val }

  $visible = $<boolean>(true)
  get visible() { return this.$visible.val }
  set visible(val) { this.$visible.val = val }

  $autofocus = $<boolean>(false)
  get autofocus() { return this.$autofocus.val }
  set autofocus(val) { this.$autofocus.val = val }


  $hovered = $<boolean>(false)
  get hovered() { return this.$hovered.val }
  set hovered(val) { this.$hovered.val = val }

  $pressed = $<boolean>(false)
  get pressed() { return this.$pressed.val }
  set pressed(val) { this.$pressed.val = val }

  $selected = $<boolean>(false)
  get selected() { return this.$selected.val }
  set selected(val) { this.$selected.val = val }


  $background = $<number>(0x00000000)
  get background() { return this.$background.val }
  set background(val) { this.$background.val = val }


  $panelOffset = $<Point>({ x: 0, y: 0 })
  get panelOffset() { return this.$panelOffset.val }
  set panelOffset(val) { this.$panelOffset.val = val }

  $mouse = $<Point>({ x: 0, y: 0 })
  get mouse() { return this.$mouse.val }
  set mouse(val) { this.$mouse.val = val }


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
