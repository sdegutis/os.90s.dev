import type { Panel } from "../core/panel.js"
import { Ref } from "../util/ref.js"

export class view {

  panel?: Panel

  readonly children: readonly view[] = []
  readonly parent: view | null = null

  get firstChild(): view | undefined { return this.children[0] }
  get lastChild(): view | undefined { return this.children[this.children.length - 1] }

  readonly adjustKeys: string[] = ['w', 'h']
  readonly layoutKeys: string[] = []
  readonly redrawKeys: string[] = ['background']

  readonly x: number = 0
  readonly y: number = 0
  readonly w: number = 0
  readonly h: number = 0

  readonly canFocus: boolean = false
  readonly visible: boolean = true
  readonly hovered: boolean = false
  readonly passthrough: boolean = false
  readonly mouse: {
    readonly x: number,
    readonly y: number,
  } = { x: 0, y: 0 }

  readonly background: string = '#0000'

  onPanelFocus?(): void
  onPanelBlur?(): void

  onMouseDown?(button: number): void
  onMouseMove?(x: number, y: number): void
  onMouseUp?(): void
  onWheel?(x: number, y: number): void

  onMouseEnter?(): void
  onMouseExit?(): void

  onFocus?(): void
  onKeyDown?(key: string): void
  onBlur?(): void

  adjust?(): void
  layout?(): void

  draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    ctx.fillStyle = this.background
    ctx.fillRect(px, py, this.w, this.h)
  }

  $update<K extends keyof this & string>(k: K, v: this[K]) {
    if (this[k] === v) return
    this[k] = v

    if (k === 'w' || k === 'h') {
      this.onResized()
      this.needsRedraw()
    }
    else if (k === 'x' || k === 'y') {
      this.onMoved()
      this.needsRedraw()
    }
    else if (this.adjustKeys.includes(k)) {
      this.adjust?.()
      this.needsRedraw()
    }
    else if (this.layoutKeys.includes(k)) {
      this.onNeedsLayout?.()
      this.needsRedraw()
    }
    else if (this.redrawKeys.includes(k)) {
      this.needsRedraw()
    }
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

  $init(data: Record<string, any>, children: view[]) {
    (this as any).children = children
    for (const child of this.children) {
      (child as any).parent = this
    }

    for (const [k, v] of Object.entries(data)) {
      if (v instanceof Ref) {
        (this as any)[k] = v.val
        v.watch(val => this.$update<any>(k, val))
      }
      else {
        (this as any)[k] = v
      }
    }

    this.adjust?.()
  }

  layoutTree() {
    this.layout?.()
    for (const child of this.children) {
      child.layoutTree()
    }
  }

  onNeedsLayout?(): void

  onResized() {
    this.parent?.onChildResized?.()
    this.needsMouseCheck()
  }

  onMoved() {
    this.needsMouseCheck()
  }

  onChildResized() {
    this.adjust?.()
  }

}

export function mutview<T extends view>(v: T) {
  const map = Object.create(null)

  const proxy = new Proxy<{ -readonly [K in keyof T]: T[K] }>(v, {
    set: (t, key, val) => { map[key] = val; return true },
    get: (t, k) => { return map[k] ??= v[k as keyof T] }
  })

  function commit() {
    for (const key in map) {
      v.$update(key as keyof T & string, map[key])
    }
  }

  return [proxy, commit] as const
}
