import { Listener } from "../../shared/listener.js"
import type { Panel } from "../core/panel.js"
import { colorFor } from "../util/colors.js"
import { $, Ref } from "../util/ref.js"
import { debounce } from "../util/throttle.js"
import { arrayEquals, pointEquals, sizeEquals, type Point, type Size } from "../util/types.js"

export class view {

  panel: Panel | null = null

  parent: view | null = null
  children: readonly view[] = []

  get firstChild(): view | undefined { return this.children[0] }
  get lastChild(): view | undefined { return this.children[this.children.length - 1] }

  point: Point = { x: 0, y: 0 }
  size: Size = { w: 0, h: 0 }

  canFocus: boolean = false
  passthrough: boolean = false
  visible: boolean = true

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

  adoptedByParent?(parent: view): void
  adoptedByPanel?(panel: Panel): void

  init() {
    this.$watch('parent', (parent) => {
      if (parent) this.adoptedByParent?.(parent)
    })

    this.$watch('panel', (panel) => {
      if (panel) this.adoptedByPanel?.(panel)
    })

    this.$watch('size', () => {
      this.layout?.()
      this.parent?.onChildResized()
      this.panel?.needsMouseCheck()
      this.needsRedraw()
    })

    this.$watch('point', () => {
      this.panel?.needsMouseCheck()
      this.needsRedraw()
    })

    this.$multiplex(
      'visible', 'hovered', 'pressed', 'selected',
      'background', 'hoverBackground', 'selectedBackground', 'pressBackground',
    ).watch(() => {
      this.needsRedraw()
    })

    this.$watch('children', () => {
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

    this.$ref('children').equals = arrayEquals
    this.$ref('point').equals = pointEquals
    this.$ref('size').equals = sizeEquals
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

  $setup() {
    const $$refs = new Map<string, Ref<any>>()
    Object.defineProperty(this, '$$refs', {
      enumerable: false,
      writable: false,
      value: $$refs,
    })

    for (const key in this) {
      let val = this[key]
      if (val instanceof Function) continue

      const ref = val instanceof Ref ? val : $(val)
      $$refs.set(key, ref)

      Object.defineProperty(this, key, {
        get: () => ref.val,
        set: (v) => ref.val = v,
        enumerable: true,
      })
    }

    const protos = []
    let proto: view | undefined = this

    while (proto = Object.getPrototypeOf(proto))
      if (Object.hasOwn(proto, 'init'))
        protos.push(proto)

    while (proto = protos.pop())
      proto.init!.call(this)

    this.adjust?.()
    this.layout?.()
  }

  $watch<K extends keyof this>(key: K, fn: (val: this[K], old: this[K]) => void) {
    return this.$ref(key).watch(([val, old]) => fn(val, old))
  }

  $ref<K extends keyof this>(key: K) {
    const { $$refs } = (this as unknown as { $$refs: Map<string, Ref<any>> })
    return $$refs.get(key as string) as Ref<this[K]>
  }

  $multiplex(...keys: (keyof this)[]) {
    const listener = new Listener()
    keys.forEach(key => this.$watch(key, () => listener.dispatch()))
    return listener
  }

}

export function make<T extends view>(
  ctor: new () => T,
  data: { [K in keyof T]?: T[K] | Ref<T[K]> },
): T {
  const v = new ctor()
  const init = data.init
  delete data.init
  Object.assign(v, data)
  v.$setup()
  const initfn = (init instanceof Ref ? init.val : init)
  initfn?.apply(v)
  return v
}
