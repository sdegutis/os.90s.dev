import { Listener } from "../../shared/listener.js"
import type { Panel } from "../core/panel.js"
import { colorFor } from "../util/colors.js"
import { $, Ref } from "../util/ref.js"

export type Point = {
  readonly x: number,
  readonly y: number,
}

export type Size = {
  readonly w: number,
  readonly h: number,
}

export class view {

  panel?: Panel

  children: readonly view[] = []
  parent: view | null = null

  get firstChild(): view | undefined { return this.children[0] }
  get lastChild(): view | undefined { return this.children[this.children.length - 1] }

  point: Point = { x: 0, y: 0 }
  size: Size = { w: 0, h: 0 }

  canFocus: boolean = false
  passthrough: boolean = false

  visible: boolean = true
  hovered: boolean = false

  background: number = 0x00000000

  mouse: Point = { x: 0, y: 0 }

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
      // this.panel?.needsMouseCheck()
      this.parent?.onChildResized?.()
      this.panel?.needsRedraw()
    })

    this.$watch('children', () => {
      this.children.forEach(c => c.parent = this)
      this.layout?.()
    })

  }

  onChildResized() {
    this.layout?.()
  }

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

  $ref<K extends keyof this>(key: K) {
    const $$refs = (this as unknown as { $$refs: Map<string, Listener<any>> }).$$refs
    return $$refs.get(key as string)
  }

  $setup() {

    const $$listeners = new Map<string, Listener<any>>()
    Object.defineProperty(this, '$$listeners', {
      enumerable: false,
      writable: false,
      value: $$listeners,
    })

    const $$refs: Record<string, Ref<any>> = Object.create(null)
    Object.defineProperty(this, '$$refs', {
      enumerable: false,
      writable: false,
      value: $$refs,
    })

    for (const key in this) {
      let val = this[key] as any
      if (val instanceof Function) continue

      if (!(val instanceof Ref)) val = $(val)
      $$refs[key] = val

      $$refs[key].watch(([val, old]) => {
        $$listeners.get(key)?.dispatch([val, old])
      })

      Object.defineProperty(this, key, {
        get: () => $$refs[key].val,
        set: (v) => $$refs[key].val = v,
        enumerable: true,
      })
    }

    this.adjust?.()
    this.layout?.()

  }

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

  return v
}
