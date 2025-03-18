import { IntrinsicNode } from "../../@imlib/jsx-browser.js"
import { Listener } from "../../shared/listener.js"
import { wRPC, type ClientPanel, type KeyMap, type ServerPanel } from "../../shared/rpc.js"
import type { MousePos, View } from "../views/interface.js"

export class Panel {

  static all = new Map<number, Panel>()

  get x() { return this._x }; _x
  get y() { return this._y }; _y
  get w() { return this._w }; _w
  get h() { return this._h }; _h

  id
  rpc

  absmouse: MousePos = { x: 0, y: 0 }
  mouse: MousePos = { x: 0, y: 0 }
  keymap: KeyMap = Object.create(null)

  didClose = new Listener()
  root

  readonly canvas = new OffscreenCanvas(0, 0)
  readonly ctx = this.canvas.getContext('2d')!

  private hoveredTree = new Set<View>()
  private hovered: View | null = null
  private clicking: View | null = null
  private focused: View | null = null

  constructor(port: MessagePort, id: number, x: number, y: number, w: number, h: number, root: IntrinsicNode) {
    Panel.all.set(id, this)

    this.canvas.width = w
    this.canvas.height = h

    this.id = id
    this._x = x
    this._y = y
    this._w = w
    this._h = h

    if (!(root instanceof IntrinsicNode)) {
      throw new Error(`panel root view must be intrinsic node`)
    }

    this.rpc = wRPC<ClientPanel, ServerPanel>(port)

    this.rpc.listen('focus', (keymap) => {
      this.keymap = keymap
      this.root.view.onPanelFocus?.()
    })

    this.rpc.listen('blur', () => {
      this.root.view.onPanelBlur?.()
    })

    this.rpc.listen('mouseentered', () => {
      // unused for now
    })

    this.rpc.listen('mouseexited', () => {
      // unused for now
    })

    this.rpc.listen('mousedown', (b) => {
      this.clicking = this.hovered
      this.hovered?.onMouseDown?.(b)

      let node: View | null = this.hovered
      while (node) {
        if (node.passthrough) continue

        if (node.canFocus) {
          this.focused?.onBlur?.()
          this.focused = node
          this.focused?.onFocus?.()
          return
        }
        node = node.parent
      }

      this.focused?.onBlur?.()
      this.focused = null
    })

    this.rpc.listen('mousemoved', (x, y) => {
      this.absmouse.x = x
      this.absmouse.y = y
      this.fixMouse()
      this.checkUnderMouse()

      const sendto = this.clicking ?? this.hovered
      sendto?.onMouseMove?.(x, y)
    })

    this.rpc.listen('mouseup', () => {
      this.clicking?.onMouseUp?.()
      this.clicking = null
    })

    this.rpc.listen('wheel', (x, y) => {
      let node: View | null = this.hovered
      while (node) {
        if (node.onWheel) {
          node.onWheel(x, y)
          return
        }
        node = node.parent
      }
    })

    this.rpc.listen('keydown', (key) => {
      this.keymap[key] = true
      this.focused?.onKeyDown?.(key)
    })

    this.rpc.listen('keyup', (key) => {
      delete this.keymap[key]
    })

    this.root = root
    this.root.data["w"] = w
    this.root.data["h"] = h
    this.root.render()

    this.hovered = this.root.view

    this.blit()
  }

  move(x: number, y: number) {
    this._x = x
    this._y = y
    this.fixMouse()
    this.rpc.send('adjust', [this.x, this.y, this.w, this.h])
  }

  resize(w: number, h: number) {
    this._w = w
    this._h = h
    this.rpc.send('adjust', [this.x, this.y, this.w, this.h])
    this.canvas.width = w
    this.canvas.height = h
    this.root.data["w"] = w
    this.root.data["h"] = h
    this.root.render()
    this.blit()
  }

  private checkUnderMouse() {
    const lastHovered = this.hoveredTree
    this.hoveredTree = new Set()

    const activeHovered = this.hover(this.root.view, this.mouse.x, this.mouse.y)

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

  private hover(node: View, x: number, y: number): View | null {
    if (!node.visible) return null

    let tx = 0
    let ty = 0
    let tw = node.w
    let th = node.h

    const inThis = (x >= tx && y >= ty && x < tw && y < th)
    if (!inThis) return null

    this.hoveredTree.add(node)

    node.mouse.x = x
    node.mouse.y = y

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
    this.drawTree(this.root.view, 0, 0)
  }

  private drawTree(
    node: View,
    x: number,
    y: number,
  ) {
    node.draw(this.ctx, x, y)

    for (const child of node.children) {
      const cx = x + child.x
      const cy = y + child.y
      const cw = Math.min(child.w, this.w - child.x)
      const ch = Math.min(child.h, this.h - child.y)

      this.ctx.save()
      this.ctx.rect(cx, cy, cw, ch)
      this.ctx.clip()

      this.drawTree(child, cx, cy)

      this.ctx.restore()
    }
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

  private fixMouse() {
    this.mouse.x = this.absmouse.x - this.x
    this.mouse.y = this.absmouse.y - this.y
  }

}
