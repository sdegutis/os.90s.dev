import { Cursor } from "../shared/cursor.js"
import { setupCanvas } from "./canvas.js"
import { Panel } from "./panel.js"
import { Process } from "./process.js"

export class Sys {

  ctx
  mouse = { x: 0, y: 0 }
  keymap = new Set<string>()

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
      e.preventDefault()

      if (e.repeat) return
      this.keymap.add(e.key)
      Process.all.forEach(p => p.rpc.send('keydown', [e.key]))
      this.redrawAllPanels()
    }

    canvas.onkeyup = (e) => {
      this.keymap.delete(e.key)
      Process.all.forEach(p => p.rpc.send('keyup', [e.key]))
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

      if (this.hovered.proc.dead && e.button === 2) {
        this.hovered.proc.terminate()
        return
      }

      this.focusPanel(this.hovered)

      this.clicking = this.hovered
      this.clicking.moveToFront()
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
    cursor.draw(this.ctx, this.mouse.x, this.mouse.y)
  }

  focusPanel(panel: Panel) {
    if (this.focused !== panel) {
      this.focused?.rpc.send('blur', [])
      this.focused = panel
      this.focused.rpc.send('focus', [])
    }
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

  useCursor(c: Cursor | null) {
    cursor = c ?? defaultCursor
    this.redrawAllPanels()
  }

}

const defaultCursor = Cursor.fromString(`
offx=1
offy=1
===
#000000cc
#ffffffff

1 1 1 1
1 2 2 1
1 2 1 1
1 1 1 0
`.trimStart())

let cursor = defaultCursor
