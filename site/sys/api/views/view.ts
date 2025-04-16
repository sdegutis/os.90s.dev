import type { DrawingContext } from "../core/drawing.js"
import { JsxAttrs } from "../core/jsx.js"
import type { Panel } from "../core/panel.js"
import { makeRef, multiplex, Ref } from "../core/ref.js"
import { type Point, type Size, arrayEquals, pointEquals, sizeEquals } from "../core/types.js"
import { debounce } from "../util/throttle.js"

export class View {

  #initwarntimer

  constructor(config?: JsxAttrs<View>) {
    this.#initwarntimer = setTimeout(() => console.warn(`View subclass didn't call super.init() and now bad things will happen`))
    this.setup(config)
  }

  protected setup<T extends View>(config?: JsxAttrs<T>) {
    if (!config) return

    for (const [key, val] of Object.entries(config)) {

      if (key === 'children' && !(val instanceof Array) && !(val instanceof Ref)) {
        this.children = [val]
        continue
      }

      if (val instanceof Ref) {
        const rkey = `$${key}` as keyof this
        const initRef = this[rkey] as Ref<any>
        initRef.defer(val)
      }
      else if (val !== undefined) {
        this[key as keyof this] = val
      }

    }

    this.init()
  }

  init() {
    clearTimeout(this.#initwarntimer)

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

    this.$size.watch(debounce(() => {
      this.layout?.()
      this.parent?._childResized(this)
      this.panel?.needsMouseCheck()
      this.needsRedraw()
    }))

    this.$point.watch(() => {
      this.panel?.needsMouseCheck()
      this.needsRedraw()
    })

    this.$alpha.watch(() => this.needsRedraw())
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

  panel: Panel | null = null; $panel = makeRef(this, 'panel')
  parent: View | null = null; $parent = makeRef(this, 'parent')

  children: View[] = []
  $children = makeRef(this, 'children')

  point: Point = { x: 0, y: 0 }
  $point = makeRef(this, 'point')

  size: Size = { w: 0, h: 0 }
  $size = makeRef(this, 'size')

  canFocus = false; $canFocus = makeRef(this, 'canFocus')
  canMouse = false; $canMouse = makeRef(this, 'canMouse')
  visible = true; $visible = makeRef(this, 'visible')
  autofocus = false; $autofocus = makeRef(this, 'autofocus')

  hovered = false; $hovered = makeRef(this, 'hovered')
  pressed = false; $pressed = makeRef(this, 'pressed')
  selected = false; $selected = makeRef(this, 'selected')


  alpha = 1
  $alpha = makeRef(this, 'alpha')

  background = 0x00000000
  $background = makeRef(this, 'background')

  panelOffset: Point = { x: 0, y: 0 }
  $panelOffset = makeRef(this, 'panelOffset')

  mouse: Point = { x: 0, y: 0 }
  $mouse = makeRef(this, 'mouse')


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

  onKeyDown?(key: string): void
  onKeyUp?(key: string): void
  onKeyPress?(key: string): boolean

  adjust?(): void
  layout?(): void

  adopted?(parent: View): void
  presented?(panel: Panel): void

  draw(ctx: DrawingContext): void {
    this.drawBackground(ctx, this.background)
  }

  private _childResized = debounce((child: View) => this.onChildResized(child))
  protected onChildResized(child: View) {
    this.adjust?.()
    this.layout?.()
  }

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

  addChild(child: View, i = this.children.length) {
    this.children = this.children.toSpliced(i, 0, child)
  }

  removeChild(child: View) {
    this.children = this.children.filter(v => v !== child)
  }

  remove() {
    this.parent?.removeChild(this)
  }

}
