import type { Cursor } from "../../shared/cursor.js"
import { Listener } from "../../shared/listener.js"
import { wRPC, type ClientPanel, type ServerPanel } from "../../shared/rpc.js"
import type { view } from "../views/view.js"

type Pos = {
  x: number,
  y: number,
}

export class Panel {

  static all = new Map<number, Panel>()

  get x() { return this._x }; _x
  get y() { return this._y }; _y
  get w() { return this._w }; _w
  get h() { return this._h }; _h

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

  constructor(keymap: Set<string>, port: MessagePort, id: number, x: number, y: number, w: number, h: number, root: JSX.Element) {
    Panel.all.set(id, this)

    this.keymap = keymap

    this.canvas.width = w
    this.canvas.height = h

    this.id = id
    this._x = x
    this._y = y
    this._w = w
    this._h = h

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
    this.root.w = w
    this.root.h = h
    this.root.layout?.()
    this.adoptTree(this.root)

    this.hovered = this.root

    this.blit()
  }

  private adoptTree(node: view) {
    node.panel = this
    node.adopted?.()
    for (const child of node.children) {
      this.adoptTree(child)
    }
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

  move(x: number, y: number) {
    this._x = x
    this._y = y
    this.fixMouse()
    this.checkUnderMouse()
    this.rpc.send('adjust', [this.x, this.y, this.w, this.h])
  }

  resize(w: number, h: number) {
    this._w = w
    this._h = h
    this.rpc.send('adjust', [this.x, this.y, this.w, this.h])
    this.canvas.width = w
    this.canvas.height = h
    this.root.w = w
    this.root.h = h
    this.blit()
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
    let tw = node.w
    let th = node.h

    const inThis = (x >= tx && y >= ty && x < tw && y < th)
    if (!inThis) return null

    this.hoveredTree.add(node)

    node.mouse = { x, y }

    let i = node.children.length
    while (i--) {
      const child = node.children[i]
      const found = this.hover(child, x - child.x, y - child.y)
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
      this.ctx.rect(x + child.x, y + child.y, child.w, child.h)
      this.ctx.clip()

      this.drawTree(child, x + child.x, y + child.y)

      this.ctx.restore()
    }
  }

  redrawTimer: number | null = null
  needsRedraw() {
    if (this.redrawTimer !== null) return
    this.redrawTimer = setTimeout(() => {
      this.redrawTimer = null
      this.blit()
    })
  }

  mouseCheckTimer: number | null = null
  needsMouseCheck() {
    if (this.mouseCheckTimer !== null) return
    this.mouseCheckTimer = setTimeout(() => {
      this.mouseCheckTimer = null
      this.checkUnderMouse()
    })
  }

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
    this.mouse.x = this.absmouse.x - this.x
    this.mouse.y = this.absmouse.y - this.y
  }

}
