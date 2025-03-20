import type { Panel } from "../core/panel.js"
import { Ref } from "../util/ref.js"

export type Pos = {
  readonly x: number,
  readonly y: number,
}

export class view {

  readonly panel?: Panel

  readonly children: readonly view[] = []
  readonly parent: view | null = null

  get firstChild(): view | undefined { return this.children[0] }
  get lastChild(): view | undefined { return this.children[this.children.length - 1] }

  private readonly adjustKeys = new Set<string>(['w', 'h'])
  private readonly layoutKeys = new Set<string>([])
  private readonly redrawKeys = new Set<string>(['background'])

  addAdjustKeys(...keys: (keyof this)[]) { keys.forEach(key => (this.adjustKeys as Set<keyof this>).add(key)) }
  addLayoutKeys(...keys: (keyof this)[]) { keys.forEach(key => (this.layoutKeys as Set<keyof this>).add(key)) }
  addRedrawKeys(...keys: (keyof this)[]) { keys.forEach(key => (this.redrawKeys as Set<keyof this>).add(key)) }

  readonly x: number = 0
  readonly y: number = 0
  readonly w: number = 0
  readonly h: number = 0

  readonly canFocus: boolean = false
  readonly passthrough: boolean = false

  readonly visible: boolean = true
  readonly hovered: boolean = false

  readonly background: number = 0x00000000

  readonly mouse: Pos = { x: 0, y: 0 }

  onPanelFocus?(): void
  onPanelBlur?(): void

  onMouseDown?(button: number, pos: Pos): void
  onMouseMove?(pos: Pos): void
  onMouseUp?(): void
  onWheel?(x: number, y: number): void

  onMouseEnter?(): void
  onMouseExit?(): void

  onFocus?(): void
  onKeyDown?(key: string): void
  onBlur?(): void

  adjust?(): void
  layout?(): void

  adopted(panel: Panel) {
    const mthis = this.mutable()
    mthis.panel = panel
    mthis.commit()
    for (const child of this.children) {
      child.adopted(panel)
    }
  }

  layoutTree() {
    this.layout?.()
    for (const child of this.children) {
      child.layoutTree()
    }
  }

  onResized() {
    this.parent?.onChildResized?.()
  }

  onMoved?(): void

  onChildResized() {
    this.adjust?.()
  }

  set(k: keyof this, newv: any) {
    const oldv = this[k]
    if (oldv === newv) return

    this[k] = newv

    if (k === 'children') {
      for (const c of newv) {
        const child = c as view
        child.set('parent', this)
      }
    }
    else if (k === 'w' || k === 'h') {
      this.onResized()
      this.panel?.needsRedraw()
      this.panel?.needsMouseCheck()
    }
    else if (k === 'x' || k === 'y') {
      this.onMoved?.()
      this.panel?.needsRedraw()
      this.panel?.needsMouseCheck()
    }
    else if (this.adjustKeys.has(k as string)) {
      this.adjust?.()
      this.panel?.needsRedraw()
    }
    else if (this.layoutKeys.has(k as string)) {
      this.layout?.()
      this.panel?.needsRedraw()
    }
    else if (this.redrawKeys.has(k as string)) {
      this.panel?.needsRedraw()
    }
  }

  draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    this.drawBackground(ctx, px, py, colorFor(this.background))
  }

  protected drawBackground(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number, bg: string) {
    ctx.fillStyle = bg
    ctx.fillRect(px, py, this.w, this.h)
  }

  get getPanel() {
    let node: view = this
    while (node.parent) node = node.parent
    return node.panel
  }

  init?(): void

  setup(data: Record<string, any>) {
    for (const [k, v] of Object.entries(data)) {
      if (v instanceof Ref) {
        this.set(k as keyof this, v.val)
        v.watch(val => this.set(k as keyof this, val))
      }
      else {
        this.set(k as keyof this, v)
      }
    }

    this.adjust?.()
    this.layout?.()
  }

  mutable(): { -readonly [K in keyof this]: this[K] } & { commit(): void } {
    const mut = Object.create(null)
    const proxy = new Proxy<any>(this, {
      set: (t, key, val) => { mut[key] = val; return true },
      get: (t, k) => { return mut[k] ??= this[k as keyof this] }
    })
    proxy.commit = () => {
      delete mut.commit
      for (const key in mut) {
        this.set(key as keyof this, mut[key])
      }
    }
    return proxy
  }

  mutate(fn: (view: { -readonly [K in keyof this]: this[K] }) => void) {
    const mut = this.mutable()
    fn(mut)
    mut.commit()
  }

}

const colors = new Map<number, string>()

export function colorFor(col: number): string {
  let color = colors.get(col)
  if (!color) colors.set(col, color = '#' + col.toString(16).padStart(8, '0'))
  return color
}

export function make<T extends view>(
  ctor: new () => T,
  data: { -readonly [K in keyof T]?: T[K] },
): T {
  const v = new ctor()

  if (data.children && data.children instanceof view) {
    data.children = [data.children]
  }

  v.setup(data)

  const protos = []
  let proto: view | undefined = v

  while (proto = Object.getPrototypeOf(proto))
    if (Object.hasOwn(proto, 'init'))
      protos.push(proto)

  while (proto = protos.pop())
    proto.init!.call(v)

  return v
}
