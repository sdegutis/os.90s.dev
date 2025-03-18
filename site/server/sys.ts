import { bitmapFromString } from "../shared/bitmap.js"
import type { KeyMap } from "../shared/rpc.js"
import { setupCanvas } from "./canvas.js"
import { Panel } from "./panel.js"

export class Sys {

  ctx
  mouse = { x: 0, y: 0 }
  keymap: KeyMap = Object.create(null)

  hovered: Panel | null = null
  focused: Panel | null = null
  clicking: Panel | null = null

  width: number
  height: number

  constructor(w: number, h: number) {
    const { canvas, ctx } = setupCanvas(w, h)
    this.ctx = ctx

    this.width = w
    this.height = h

    canvas.oncontextmenu = (e) => {
      e.preventDefault()
    }

    canvas.onkeydown = (e) => {
      this.keymap[e.key] = true
      this.focused?.rpc.send('keydown', [e.key])
      this.redrawAllPanels()
    }

    canvas.onkeyup = (e) => {
      delete this.keymap[e.key]
      this.focused?.rpc.send('keyup', [e.key])
      this.redrawAllPanels()
    }

    canvas.onmousemove = (e) => {
      const x = Math.min(w - 1, e.offsetX)
      const y = Math.min(h - 1, e.offsetY)

      if (x === this.mouse.x && y === this.mouse.y) return
      this.mouse.x = x
      this.mouse.y = y

      this.checkUnderMouse()

      const sendto = this.clicking ?? this.hovered
      sendto?.rpc.send('mousemoved', [this.mouse.x, this.mouse.y])

      this.redrawAllPanels()
    }

    canvas.onmousedown = (e) => {
      if (!this.hovered) return

      if (this.focused !== this.hovered) {
        this.focused?.rpc.send('blur', [])
        this.focused = this.hovered
        this.focused.rpc.send('focus', [this.keymap])
      }

      this.hovered.moveToFront()

      this.clicking = this.hovered
      this.clicking.rpc.send('mousedown', [e.button])
      this.redrawAllPanels()
    }

    canvas.onmouseup = (e) => {
      this.clicking?.rpc.send('mouseup', [])
      this.clicking = null
      this.redrawAllPanels()
    }

    canvas.onwheel = (e) => {
      this.hovered?.rpc.send('wheel', [e.deltaX, e.deltaY])
      this.redrawAllPanels()
    }
  }

  private findHovered() {
    for (const panel of Panel.ordered.toReversed()) {
      if (this.mouse.x >= panel.x && this.mouse.y >= panel.y &&
        this.mouse.x < panel.x + panel.w &&
        this.mouse.y < panel.y + panel.h
      ) return panel
    }
    return null
  }

  redrawAllPanels() {
    this.ctx.clearRect(0, 0, this.width, this.height)
    for (const panel of Panel.ordered) {
      if (panel.img) {
        this.ctx.drawImage(panel.img, panel.x, panel.y)
      }
    }
    this.drawCursor()
  }

  private checkUnderMouse() {
    const newhovered = this.findHovered()
    if (newhovered !== this.hovered) {
      this.hovered?.rpc.send('mouseexited', [])
      this.hovered = newhovered
      this.hovered?.rpc.send('mouseentered', [])
    }
  }

  private drawCursor() {
    this.ctx.drawImage(cursor.canvas, this.mouse.x, this.mouse.y)
  }

  removePanel(panel: Panel) {
    if (!Panel.all.delete(panel.id)) return

    const i = Panel.ordered.indexOf(panel)
    Panel.ordered.splice(i, 1)

    if (this.hovered === panel) this.hovered = null
    if (this.clicking === panel) this.clicking = null
    if (this.focused === panel) this.focused = null

    this.checkUnderMouse()

    this.redrawAllPanels()
  }

}

const cursor = bitmapFromString(`
000000cc
ffffffff
fffffffe

1 1 1 1
1 3 2 1
1 2 1 1
1 1 1 0
`.trimStart())
