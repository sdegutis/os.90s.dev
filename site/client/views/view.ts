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

  readonly adjustKeys: readonly string[] = ['w', 'h']
  readonly layoutKeys: readonly string[] = []
  readonly redrawKeys: readonly string[] = ['background']

  addAdjustKeys(...keys: (keyof this)[]) { (this.adjustKeys as (keyof this)[]).push(...keys) }
  addLayoutKeys(...keys: (keyof this)[]) { (this.layoutKeys as (keyof this)[]).push(...keys) }
  addRedrawKeys(...keys: (keyof this)[]) { (this.redrawKeys as (keyof this)[]).push(...keys) }

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

  layoutTree() {
    this.layout?.()
    for (const child of this.children) {
      child.layoutTree()
    }
  }

  onNeedsLayout?(): void

  onResized() {
    this.parent?.onChildResized?.()
  }

  onMoved?(): void

  onChildResized() {
    this.adjust?.()
  }

  private _commit(mut: any) {
    let mode: 'size' | 'pos' | 'adjust' | 'layout' | 'redraw' | null = null

    delete mut.commit
    for (const key in mut) {
      const k = key as keyof this & string
      const v = mut[k]

      if (this[k] === v) continue
      this[k] = v

      if (k === 'children') {
        mode ??= 'layout'
        for (const c of v) {
          const child = c as view
          child.mutate(v => v.parent = this)
        }
      }
      else if (k === 'w' || k === 'h') mode ??= 'size'
      else if (k === 'x' || k === 'y') mode ??= 'pos'
      else if (this.adjustKeys.includes(k)) mode ??= 'adjust'
      else if (this.layoutKeys.includes(k)) mode ??= 'layout'
      else if (this.redrawKeys.includes(k)) mode ??= 'redraw'
    }

    switch (mode) {
      case 'size': {
        this.onResized()
        this.needsRedraw()
        this.needsMouseCheck()
        break
      }
      case 'pos': {
        this.onMoved?.()
        this.needsRedraw()
        this.needsMouseCheck()
        break
      }
      case 'adjust': {
        this.adjust?.()
        this.needsRedraw()
        break
      }
      case 'layout': {
        this.onNeedsLayout?.()
        this.needsRedraw()
        break
      }
      case 'redraw': {
        this.needsRedraw()
      }
    }
  }

  draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    this.drawBackground(ctx, px, py, colorFor(this.background))
  }

  protected drawBackground(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number, bg: string) {
    ctx.fillStyle = bg
    ctx.fillRect(px, py, this.w, this.h)
  }

  protected needsRedraw() {
    let node: view = this
    while (node.parent) node = node.parent
    node.panel?.needsRedraw()
  }

  protected needsMouseCheck() {
    let node: view = this
    while (node.parent) node = node.parent
    node.panel?.needsMouseCheck()
  }

  get getPanel() {
    let node: view = this
    while (node.parent) node = node.parent
    return node.panel
  }

  init?(): void

  setup(data: Record<string, any>, children: readonly view[]) {
    (this as any).children = children
    for (const child of this.children) {
      (child as any).parent = this
    }

    for (const [k, v] of Object.entries(data)) {
      if (v instanceof Ref) {
        (this as any)[k] = v.val
        v.watch(val => this.mutate(v => v[k as keyof this] = val))
      }
      else {
        (this as any)[k] = v
      }
    }

    this.adjust?.()
    this.layout?.()
  }

  mutable() {
    const mut = Object.create(null)
    const proxy = new Proxy<{ -readonly [K in keyof this]: this[K] }>(this, {
      set: (t, key, val) => { mut[key] = val; return true },
      get: (t, k) => { return mut[k] ??= this[k as keyof this] }
    })
    proxy.commit = () => this._commit(mut)
    return proxy
  }

  mutate(fn: (view: { -readonly [K in keyof this]: this[K] }) => void) {
    const mut = this.mutable()
    fn(mut)
    mut.commit()
  }

  commit() { }

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
  const view = new ctor()

  const children: readonly view[] = data.children ?? []
  delete data.children

  view.setup(data, children)

  const protos = []
  let proto: view | undefined = view

  while (proto = Object.getPrototypeOf(proto))
    if (Object.hasOwn(proto, 'init'))
      protos.push(proto)

  while (proto = protos.pop())
    proto.init!.call(view)

  return view
}
