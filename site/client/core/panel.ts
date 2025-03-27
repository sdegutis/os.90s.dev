import { Listener } from "./listener.js"
import { $, multiplex, Ref } from "./ref.js"
import { ClientPanel, PanelOrdering, ServerPanel, wRPC } from "./rpc.js"
import { Point, Size } from "./types.js"
import { program } from "/client/core/prog.js"
import { debounce } from "/client/util/throttle.js"
import { View } from "/client/views/view.js"
import { Cursor } from "/shared/cursor.js"
import { DrawingContext } from "/shared/drawing.js"

export class Panel {

  static all = new Map<number, Panel>()

  readonly $point: Ref<Point>
  get point() { return this.$point.val }
  set point(s: Point) { this.$point.val = s }

  readonly $size: Ref<Size>
  get size() { return this.$size.val }
  set size(s: Size) { this.$size.val = s }

  readonly $absmouse: Ref<Point> = $({ x: 0, y: 0 })
  get absmouse() { return this.$absmouse.val }
  set absmouse(p: Point) { this.$absmouse.val = p }

  readonly $mouse: Ref<Point>
  get mouse() { return this.$mouse.val }
  set mouse(p: Point) { this.$mouse.val = p }

  id
  rpc
  root
  keymap = new Set<string>()
  didClose = new Listener()
  isFocused = false

  readonly ctx = new DrawingContext()

  private hoveredTree = new Set<View>()
  private hovered: View | null = null
  private clicking: View | null = null
  private focused: View | null = null

  static async create(view: JSX.Element, config?: {
    order?: PanelOrdering,
    pos?: Ref<Point> | 'default' | 'center',
  }) {
    return await program.makePanel({ view, ...config })
  }

  constructor(keymap: Set<string>, port: MessagePort, id: number, point: Ref<Point>, size: Ref<Size>, root: JSX.Element) {
    Panel.all.set(id, this)

    this.id = id
    this.keymap = keymap

    this.$point = point
    this.$size = size

    this.$mouse = multiplex([this.$absmouse, this.$point], () => ({
      x: this.absmouse.x - this.point.x,
      y: this.absmouse.y - this.point.y,
    }))

    this.ctx.canvas.width = size.val.w
    this.ctx.canvas.height = size.val.h

    size.watch((size) => {
      this.rpc.send('adjust', [this.point.x, this.point.y, size.w, size.h])
      this.ctx.canvas.width = size.w
      this.ctx.canvas.height = size.h
      this.blit()
    })

    point.watch((point) => {
      this.rpc.send('adjust', [point.x, point.y, this.size.w, this.size.h])
      this.checkUnderMouse()
    })

    this.rpc = new wRPC<ClientPanel, ServerPanel>(port, {

      focus: () => {
        this.isFocused = true
        this.root.onPanelFocus?.()
        this.focused?.onFocus?.()
      },

      blur: () => {
        this.isFocused = false
        this.root.onPanelBlur?.()
        this.focused?.onBlur?.()
      },

      mouseentered: () => {
        // unused for now
      },

      mouseexited: () => {
        for (const view of this.hoveredTree) {
          view.onMouseExit?.()
          view.hovered = false
        }
        if (this.hovered) this.hovered.hovered = false
        this.hovered = null
        this.hoveredTree.clear()
      },

      mousemoved: (x, y) => {
        this.absmouse = { x, y }
        this.checkUnderMouse()

        const sendto = this.clicking ?? this.hovered
        sendto?.onMouseMove?.(this.mouse)
      },

      mousedown: (b) => {
        this.clicking = this.hovered
        if (this.clicking) this.clicking.pressed = true
        this.hovered?.onMouseDown?.(b)

        let node: View | null = this.hovered
        while (node) {
          if (node.canMouse && this.focusView(node)) {
            return
          }
          node = node.parent
        }
      },

      mouseup: () => {
        this.clicking?.onMouseUp?.()
        if (this.clicking) this.clicking.pressed = false
        this.clicking = null
      },

      wheel: (x, y) => {
        let node: View | null = this.hovered
        while (node) {
          if (node.onWheel) {
            node.onWheel(x, y)
            return
          }
          node = node.parent
        }
      },

      needblit: () => {
        this.blit()
      },

    })

    this.root = root
    this.adoptTree(this.root)

    this.hovered = this.root

    this.blit()
  }

  adoptTree(node: View) {
    node.panel = this
    for (const child of node.children) {
      this.adoptTree(child)
    }
  }

  focusPanel() {
    this.rpc.send('focus', [])
  }

  focusView(node: View) {
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

  private sendKeyDown(key: string) {
    let node = this.focused
    while (node) {
      if (node.onKeyDown?.(key)) return
      node = node.parent
    }
  }

  onKeyDown(key: string) {
    this.sendKeyDown(key)

    this.clearRepeater?.()
    let repeater = setTimeout(() => {
      repeater = setInterval(() => {
        this.sendKeyDown(key)
      }, 50)
      this.clearRepeater = () => clearInterval(repeater)
    }, 500)
    this.clearRepeater = () => clearTimeout(repeater)
  }

  private clearRepeater?: () => void

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

  private hover(node: View, x: number, y: number): View | null {
    if (!node.visible) return null

    let tx = 0
    let ty = 0
    let tw = node.size.w
    let th = node.size.h

    const inThis = (x >= tx && y >= ty && x < tw && y < th)
    if (!inThis) return null

    this.hoveredTree.add(node)

    let i = node.children.length
    while (i--) {
      const child = node.children[i]
      const found = this.hover(child, x - child.point.x, y - child.point.y)
      if (found) return found
    }

    if (!node.canMouse) return null

    return node
  }

  redrawRoot() {
    this.drawTree(this.root, 0, 0)
  }

  private drawTree(
    node: View,
    x: number,
    y: number,
  ) {
    if (!node.visible) return

    node.draw(this.ctx, x, y)

    for (const child of node.children) {
      this.ctx.clip(x + child.point.x, y + child.point.y, child.size.w, child.size.h)

      child.panelOffset = {
        x: x + child.point.x,
        y: y + child.point.y,
      }

      this.drawTree(child, child.panelOffset.x, child.panelOffset.y)

      this.ctx.unclip()
    }
  }

  needsRedraw = debounce(() => {
    this.blit()
  })

  needsMouseCheck = debounce(() => {
    this.checkUnderMouse()
  })

  private cursors: Cursor[] = []

  pushCursor(c: Cursor) {
    this.cursors.push(c)
    if (this.cursors.length === 1) {
      this.setCursor(c)
    }
  }

  popCursor(c: Cursor) {
    const idx = this.cursors.findIndex(cursor => cursor === c)
    if (idx === -1) return
    const oldFirst = this.cursors[0]
    this.cursors.splice(idx, 1)
    if (this.cursors[0] !== oldFirst) {
      this.setCursor(this.cursors[0] ?? null)
    }
  }

  private setCursor(c: Cursor | null) {
    this.rpc.send('cursor', [c?.toString() ?? ''])
  }

  blit() {
    this.redrawRoot()
    const bmp = this.ctx.canvas.transferToImageBitmap()
    this.rpc.send('blit', [bmp], [bmp])
  }

  close() {
    this.rpc.send('close', [])
    this.didClose.dispatch()
  }

  isKeyDown(key: string) {
    return this.keymap.has(key)
  }

}

export type CursorLock = {
  push(): void
  pop(): void
}
