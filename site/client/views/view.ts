import { Listener } from "../../shared/listener.js"
import type { Panel } from "../core/panel.js"
import { colorFor } from "../util/colors.js"
import { $, Ref, type Equals } from "../util/ref.js"
import { debounce } from "../util/throttle.js"

export type Point = {
  readonly x: number,
  readonly y: number,
}

export type Size = {
  readonly w: number,
  readonly h: number,
}

export class view {

  panel?: Panel | undefined

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

  visible: boolean = true
  hovered: boolean = false

  background: number = 0x00000000

  mouse: Point = { x: 0, y: 0 }
  protected mouse$equals: Equals<typeof this.mouse> = pointEquals

  onPanelFocus?(): void
  onPanelBlur?(): void

  onMouseDown?(button: number, pos: Point): void
  onMouseMove?(pos: Point): void
  onMouseUp?(): void
  onWheel?(x: number, y: number): void

  onMouseEnter?(): void
  onMouseExit?(): void

  onFocus?(): void
  onKeyDown?(key: string): void
  onKeyUp?(key: string): void
  onBlur?(): void

  adopted?(): void

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

    this.$watch('children', () => {
      for (const child of this.children) {
        child.parent = this
        child.adoptTree(this.panel)
      }
      this.adjust?.()
      this.layout?.()
      this.needsRedraw()
    })
  }

  adoptTree(panel: Panel | undefined) {
    this.panel = panel
    this.adopted?.()
    for (const child of this.children) {
      child.adoptTree(panel)
    }
  }

  onChildResized = debounce(() => {
    this.adjust?.()
    this.layout?.()
  })

  needsRedraw() {
    this.panel?.needsRedraw()
  }

  adjust?(): void
  layout?(): void

  $multiplex(...keys: (keyof this)[]) {
    const listener = new Listener()
    keys.forEach(key => this.$watch(key, () => listener.dispatch()))
    return listener
  }

  $watch<K extends keyof this>(key: K, fn: (val: this[K], old: this[K]) => void) {
    const $$listeners = (this as unknown as { $$listeners: Map<string, Listener<any>> }).$$listeners
    let val = $$listeners.get(key as string)
    if (!val) $$listeners.set(key as string, val = new Listener())
    return val.watch(([data, old]) => fn(data, old))
  }

  $setup() {
    const $$listeners = new Map<string, Listener<any>>()
    Object.defineProperty(this, '$$listeners', {
      enumerable: false,
      writable: false,
      value: $$listeners,
    })

    for (const key in this) {
      let val = this[key] as any
      if (val instanceof Function) continue

      const ref = val instanceof Ref ? val : $(val)
      ref.equals = (this as any)[`${key as string}$equals`]
      ref.watch(([val, old]) => {
        $$listeners.get(key)?.dispatch([val, old])
      })

      Object.defineProperty(this, key, {
        get: () => ref.val,
        set: (v) => ref.val = v,
        enumerable: true,
      })
    }
  }

}

export const pointEquals = (a: Point, b: Point) => {
  return a.x === b.x && a.y === b.y
}

export const sizeEquals = (a: Size, b: Size) => {
  return a.w === b.w && a.h === b.h
}
export const arrayEquals = <T extends ArrayLike<any>>(a: T, b: T) => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function make<T extends view>(
  ctor: new () => T,
  data: { [K in keyof T]?: T[K] | Ref<T[K]> },
): T {
  const v = new ctor()
  Object.assign(v, data)
  v.$setup()

  const protos = []
  let proto: view | undefined = v

  while (proto = Object.getPrototypeOf(proto))
    if (Object.hasOwn(proto, 'init'))
      protos.push(proto)

  while (proto = protos.pop())
    proto.init!.call(v)

  v.adjust?.()
  v.layout?.()

  return v
}
