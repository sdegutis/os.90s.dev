import { Listener } from "../../shared/listener.js"
import type { Panel } from "../core/panel.js"
import { colorFor } from "../util/colors.js"
import { $, Ref, type Equals } from "../util/ref.js"
import { debounce } from "../util/throttle.js"
import { arrayEquals, pointEquals, sizeEquals, type Point, type Size } from "../util/types.js"

export class view {

  panel: Panel | null = null

  parent: view | null = null
  children: readonly view[] = []
  protected children$equals: Equals<typeof this.children> = arrayEquals

  get firstChild(): view | undefined { return this.children[0] }
  get lastChild(): view | undefined { return this.children[this.children.length - 1] }

  point: Point = { x: 0, y: 0 }
  protected point$equals: Equals<typeof this.point> = pointEquals

  size: Size = { w: 0, h: 0 }
  protected size$equals: Equals<typeof this.size> = sizeEquals

  canFocus: boolean = false
  passthrough: boolean = false
  hovered: boolean = false
  visible: boolean = true
  background: number = 0x00000000

  mouse: Point = { x: 0, y: 0 }
  protected mouse$equals: Equals<typeof this.mouse> = pointEquals

  onPanelFocus?(): void
  onPanelBlur?(): void
  adopted?(): void

  onMouseDown?(button: number, pos: Point): void
  onMouseMove?(pos: Point): void
  onMouseUp?(): void

  onMouseEnter?(): void
  onMouseExit?(): void

  onWheel?(x: number, y: number): void

  onFocus?(): void
  onBlur?(): void

  onKeyDown?(key: string): void
  onKeyUp?(key: string): void

  adjust?(): void
  layout?(): void

  init() {
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

    this.$watch('visible', () => {
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
  }

  draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    this.drawBackground(ctx, px, py, colorFor(this.background))
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
    this.adopted?.()
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
      let val = this[key] as any
      if (val instanceof Function) continue

      const ref = val instanceof Ref ? val : $(val)
      ref.equals = (this as any)[`${key as string}$equals`]
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
