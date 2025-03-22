import type { Cursor } from "../../shared/cursor.js"
import { Listener } from "../../shared/listener.js"
import { wRPC, type ClientPanel, type ServerPanel } from "../../shared/rpc.js"
import type { Ref } from "../util/ref.js"
import { debounce } from "../util/throttle.js"
import type { Point, Size } from "../util/types.js"
import type { view } from "../views/view.js"

type Pos = {
  x: number,
  y: number,
}

export class Panel {

  static all = new Map<number, Panel>()

  private _point: Ref<Point>
  get point() { return this._point.val }
  set point(s: Point) { this._point.val = s }

  private _size: Ref<Size>
  get size() { return this._size.val }
  set size(s: Size) { this._size.val = s }

  id
  rpc

  absmouse: Pos = { x: 0, y: 0 }
  mouse: Pos = { x: 0, y: 0 }
  keymap = new Set<string>()

  didClose = new Listener()
  root

  isFocused = false

  readonly canvas = new OffscreenCanvas(0, 0)
  readonly ctx = this.canvas.getContext('2d')!

  private hoveredTree = new Set<view>()
  private hovered: view | null = null
  private clicking: view | null = null
  private focused: view | null = null

  constructor(keymap: Set<string>, port: MessagePort, id: number, point: Ref<Point>, size: Ref<Size>, root: JSX.Element) {
    Panel.all.set(id, this)

    this.id = id
    this.keymap = keymap

    this._point = point
    this._size = size

    this.canvas.width = size.val.w
    this.canvas.height = size.val.h

    size.watch(([size]) => {
      this.rpc.send('adjust', [this.point.x, this.point.y, size.w, size.h])
      this.canvas.width = size.w
      this.canvas.height = size.h
      this.blit()
    })

    point.watch(([point]) => {
      this.rpc.send('adjust', [point.x, point.y, this.size.w, this.size.h])
      this.fixMouse()
      this.checkUnderMouse()
    })

    this.rpc = wRPC<ClientPanel, ServerPanel>(port)

    this.rpc.listen('needblit', () => {
      this.blit()
    })

    this.rpc.listen('focus', () => {
      this.isFocused = true
      this.root.onPanelFocus?.()
      this.focused?.onFocus?.()
    })

    this.rpc.listen('blur', () => {
      this.isFocused = false
      this.root.onPanelBlur?.()
      this.focused?.onBlur?.()
    })

    this.rpc.listen('mouseentered', () => {
      // unused for now
    })

    this.rpc.listen('mouseexited', () => {
      for (const view of this.hoveredTree) {
        view.onMouseExit?.()
        view.hovered = false
      }
      this.hoveredTree.clear()
    })

    this.rpc.listen('mousedown', (b) => {
      this.clicking = this.hovered
      this.hovered?.onMouseDown?.(b, this.absmouse)

      let node: view | null = this.hovered
      while (node) {
        if (!node.passthrough && this.focusView(node)) {
          return
        }
        node = node.parent
      }

      // this.focused?.onBlur?.()
      // this.focused = null
    })

    this.rpc.listen('mousemoved', (x, y) => {
      this.absmouse.x = x
      this.absmouse.y = y
      this.fixMouse()
      this.checkUnderMouse()

      const sendto = this.clicking ?? this.hovered
      sendto?.onMouseMove?.(this.absmouse)
    })

    this.rpc.listen('mouseup', () => {
      this.clicking?.onMouseUp?.()
      this.clicking = null
    })

    this.rpc.listen('wheel', (x, y) => {
      let node: view | null = this.hovered
      while (node) {
        if (node.onWheel) {
          node.onWheel(x, y)
          return
        }
        node = node.parent
      }
    })

    this.root = root
    this.root.adoptTree(this)

    this.hovered = this.root

    this.blit()
  }

  focus() {
    this.rpc.send('focus', [])
  }

  focusView(node: view) {
    if (node === this.focused) return true
    if (!node.canFocus) return false

    if (!this.isFocused) {
      this.focused = node
      return true
    }

    this.focused?.onBlur?.()
    this.focused = node
    this.focused?.onFocus?.()

    return true
  }

  onKeyDown(key: string) {
    this.focused?.onKeyDown?.(key)

    this.clearRepeater?.()
    let repeater = setTimeout(() => {
      repeater = setInterval(() => {
        this.focused?.onKeyDown?.(key)
      }, 50)
      this.clearRepeater = () => clearInterval(repeater)
    }, 500)
    this.clearRepeater = () => clearTimeout(repeater)
  }

  clearRepeater?: () => void

  onKeyUp(key: string) {
    this.clearRepeater?.()
    this.focused?.onKeyUp?.(key)
  }

  private checkUnderMouse() {
    const lastHovered = this.hoveredTree
    this.hoveredTree = new Set()

    const activeHovered = this.hover(this.root, this.mouse.x, this.mouse.y)

    for (const view of this.hoveredTree.difference(lastHovered)) {
      view.onMouseEnter?.()
    }

    for (const view of lastHovered.difference(this.hoveredTree)) {
      view.onMouseExit?.()
    }

    if (this.hovered !== activeHovered) {
      if (this.hovered) this.hovered.hovered = false
      this.hovered = activeHovered
      if (this.hovered) this.hovered.hovered = true
    }
  }

  private hover(node: view, x: number, y: number): view | null {
    if (!node.visible) return null

    let tx = 0
    let ty = 0
    let tw = node.size.w
    let th = node.size.h

    const inThis = (x >= tx && y >= ty && x < tw && y < th)
    if (!inThis) return null

    this.hoveredTree.add(node)

    node.mouse = { x, y }

    let i = node.children.length
    while (i--) {
      const child = node.children[i]
      const found = this.hover(child, x - child.point.x, y - child.point.y)
      if (found) return found
    }

    if (node.passthrough) return null

    return node
  }

  redrawRoot() {
    this.drawTree(this.root, 0, 0)
  }

  private drawTree(
    node: view,
    x: number,
    y: number,
  ) {
    if (node.visible) {
      node.draw(this.ctx, x, y)
    }

    for (const child of node.children) {
      this.ctx.save()
      this.ctx.beginPath()
      this.ctx.rect(x + child.point.x, y + child.point.y, child.size.w, child.size.h)
      this.ctx.clip()

      this.drawTree(child, x + child.point.x, y + child.point.y)

      this.ctx.restore()
    }
  }

  needsRedraw = debounce(() => {
    this.blit()
  })

  needsMouseCheck = debounce(() => {
    this.checkUnderMouse()
  })

  setCursor(c: Cursor | null) {
    this.rpc.send('cursor', [c?.toString() ?? ''])
  }

  blit() {
    this.redrawRoot()
    const bmp = this.canvas.transferToImageBitmap()
    this.rpc.send('blit', [bmp], [bmp])
  }

  close() {
    this.rpc.send('close', [])
    this.didClose.dispatch()
  }

  isKeyDown(key: string) {
    return this.keymap.has(key)
  }

  private fixMouse() {
    this.mouse.x = this.absmouse.x - this.point.x
    this.mouse.y = this.absmouse.y - this.point.y
  }

}
