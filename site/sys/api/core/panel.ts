import { debounce } from "../util/throttle.js"
import type { View } from "../views/view.js"
import { DrawingContext } from "./drawing.js"
import { Listener, ListenerDone } from "./listener.js"
import { type Ref, makeRef, multiplex } from "./ref.js"
import { type ClientPanel, type ServerPanel, wRPC } from "./rpc.js"
import { sys } from "./sys.js"
import { type Point, type Size, pointEquals, sizeEquals } from "./types.js"

export class Panel {

  static all = new Map<number, Panel>()

  readonly $point: Ref<Point>
  get point() { return this.$point.val }
  set point(s: Point) { this.$point.set(s) }

  readonly $size: Ref<Size>
  get size() { return this.$size.val }
  set size(s: Size) { this.$size.set(s) }

  readonly $mouse: Ref<Point>
  get mouse() { return this.$mouse.val }
  set mouse(p: Point) { this.$mouse.set(p) }

  name
  readonly $name

  id
  rpc
  root
  didClose = new Listener()

  isFocused = false
  readonly $isFocused = makeRef(this, 'isFocused')

  readonly ctx = new DrawingContext()

  private hoveredTree = new Set<View>()
  private hovered: View | null = null
  private clicking: View | null = null
  focused: View | null = null

  constrainToDesktop

  // #internalAdjusts = new Set<string>()

  #sendAdjust = debounce(() => {
    // this.#internalAdjusts.add([this.point.x, this.point.y, this.size.w, this.size.h].join(','))
    sys.adjustPanel(this.id, this.point.x, this.point.y, this.size.w, this.size.h)
  })

  constructor(port: MessagePort, id: number, root: View, name: string, constrainToDesktop: boolean) {
    Panel.all.set(id, this)

    this.constrainToDesktop = constrainToDesktop
    this.id = id

    this.name = name
    this.$name = makeRef(this, 'name')

    this.$name.watch(name => {
      this.rpc.send('renamed', [name])
    })

    this.$point = root.$point
    this.$size = root.$size

    if (this.constrainToDesktop) {
      this.$point.intercept(point => ({
        x: Math.max(0, Math.min(point.x, sys.desktop.w - sys.desktop.x - 20)),
        y: Math.max(0, Math.min(point.y, sys.desktop.h - sys.desktop.y - 10)),
      }))
    }

    this.$mouse = multiplex([sys.$mouse, this.$point], (m, p) => ({ x: m.x - p.x, y: m.y - p.y }))

    this.ctx.size = root.$size.val

    let adjustedFromRpc = false

    this.$size.watch(() => {
      if (!adjustedFromRpc) this.#sendAdjust()
      this.#onSizeChanged()
    })

    this.$point.watch(() => {
      if (!adjustedFromRpc) this.#sendAdjust()
      this.#onPointChanged()
    })

    let doneWatchingKeyPresses: ListenerDone

    this.rpc = new wRPC<ClientPanel, ServerPanel>(port, {

      adjusted: (x, y, w, h) => {
        // if (this.#internalAdjusts.delete([x, y, w, h].join(','))) return

        adjustedFromRpc = true
        this.point = { x, y }
        this.size = { w, h }
        adjustedFromRpc = false
      },

      focus: () => {
        this.isFocused = true
        this.root.onPanelFocus?.()
        this.focused?.onFocus?.()
        doneWatchingKeyPresses = sys.onKeyPress.watch((key) => {
          this.handleKeyPress(key)
        })
      },

      blur: () => {
        this.isFocused = false
        clearTimeout(this.#repeater)
        this.root.onPanelBlur?.()
        this.focused?.onBlur?.()
        doneWatchingKeyPresses?.()
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
        sys.mouse = { x, y }
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

  #onSizeChanged() {
    this.checkUnderMouse()
    this.ctx.size = this.size
    this.blit()
  }

  #onPointChanged() {
    this.checkUnderMouse()
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

  onKeyDown(key: string) {
    this.focused?.onKeyDown?.(key)
  }

  onKeyUp(key: string) {
    clearTimeout(this.#repeater)
    this.focused?.onKeyUp?.(key)
  }

  #repeater: number | undefined

  private handleKeyPress(key: string) {
    const modified = key.includes(' ') && key !== ' '

    let node = this.focused
    while (node) {
      if (node?.onKeyPress?.(key)) {
        if (!modified) {
          const repeat = () => node!.onKeyPress!(key)
          clearTimeout(this.#repeater)
          this.#repeater = setTimeout(() => {
            this.#repeater = setInterval(repeat, 50)
          }, 333)
        }
        break
      }
      node = node.parent
    }
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

  private drawTree(
    node: View,
    x: number,
    y: number,
  ) {
    if (!node.visible) return

    const alpha = this.ctx.alpha
    this.ctx.alpha *= node.alpha

    node.draw(this.ctx)

    for (const child of node.children) {
      child.panelOffset = {
        x: x + child.point.x,
        y: y + child.point.y,
      }

      const contained = fullyContains(node, child)

      if (!contained) this.ctx.pushClip(node.size.w, node.size.h)
      this.ctx.pushTranslate(child.point)

      this.drawTree(child, child.panelOffset.x, child.panelOffset.y)

      this.ctx.popTranslate(child.point)
      if (!contained) this.ctx.popClip()
    }

    this.ctx.alpha = alpha
  }

  needsRedraw = debounce(() => {
    this.blit()
  })

  needsMouseCheck = debounce(() => {
    this.checkUnderMouse()
  })

  blit() {
    this.drawTree(this.root, 0, 0)
    const bmp = this.ctx.transferToImageBitmap()
    this.rpc.send('blit', [bmp], [bmp])
  }

  close() {
    this.rpc.send('close', [])
    this.didClose.dispatch()
  }

  minimize() {
    sys.hidePanel(this.id)
  }

  private unmaxed?: (Point & Size) | undefined

  maximize() {
    const isMax = pointEquals(this.point, sys.desktop) && sizeEquals(this.size, sys.desktop)
    if (isMax) {
      if (this.unmaxed) {
        this.point = { x: this.unmaxed.x, y: this.unmaxed.y }
        this.size = { w: this.unmaxed.w, h: this.unmaxed.h }
        delete this.unmaxed
      }
    }
    else {
      this.unmaxed = { ...this.point, ...this.size }
      this.point = { x: sys.desktop.x, y: sys.desktop.y }
      this.size = { w: sys.desktop.w, h: sys.desktop.h }
    }
  }

  hide() {
    sys.hidePanel(this.id)
  }

  show() {
    sys.showPanel(this.id)
  }

}

export type CursorLock = {
  push(): void
  pop(): void
}

function fullyContains(outer: View, inner: View) {
  if (inner.panelOffset.x < outer.panelOffset.x) return false
  if (inner.panelOffset.y < outer.panelOffset.y) return false
  if (inner.panelOffset.x + inner.size.w > outer.panelOffset.x + outer.size.w) return false
  if (inner.panelOffset.y + inner.size.h > outer.panelOffset.y + outer.size.h) return false
  return true
}
