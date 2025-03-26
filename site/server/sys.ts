import { Cursor } from "../shared/cursor.js"
import { $ } from "../shared/ref.js"
import { setupCanvas } from "./canvas.js"
import { fs } from "./fs/fs.js"
import { Panel } from "./panel.js"
import { Process } from "./process.js"

export class Sys {

  private ctx
  mouse = { x: 0, y: 0 }
  keymap = new Set<string>()

  hovered: Panel | null = null
  focused: Panel | null = null
  clicking: Panel | null = null
  prevFocused: Panel | null = null

  $size
  get size() { return this.$size.val }

  constructor(width: number, height: number) {
    this.$size = $({ w: width, h: height })

    const { canvas, ctx } = setupCanvas(this.$size)
    this.ctx = ctx

    canvas.oncontextmenu = (e) => {
      e.preventDefault()
    }

    canvas.onkeydown = (e) => {
      if (e.key.match(/^F\d{1,2}$/)) return
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
      const x = Math.min(this.size.w - 1, e.offsetX)
      const y = Math.min(this.size.h - 1, e.offsetY)

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

      this.clicking = this.hovered
      this.focusPanel(this.clicking)

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

  resize(w: number, h: number) {
    this.$size.val = { w, h }
    Process.all.forEach(p => p.rpc.send('resized', [w, h]))
    this.redrawAllPanels()
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
    this.ctx.clearRect(0, 0, this.size.w, this.size.h)
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
      this.prevFocused = this.focused
      this.focused?.rpc.send('blur', [])
      this.focused = panel
      this.focused.rpc.send('focus', [])
    }
    panel.moveToFront()
  }

  removePanel(panel: Panel) {
    if (!Panel.all.delete(panel.id)) return

    const i = Panel.ordered.indexOf(panel)
    Panel.ordered.splice(i, 1)

    if (this.hovered === panel) this.hovered = null
    if (this.clicking === panel) this.clicking = null
    if (this.focused === panel) this.focused = null

    if (this.prevFocused) {
      const prev = this.prevFocused
      this.prevFocused = null
      this.focusPanel(prev)
    }

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
#000000ff
#ffffffff

1 1 1 1
1 2 2 1
1 2 1 1
1 1 1 0
`.trimStart())

// const defaultCursor = Cursor.fromString(`
// offx=1
// offy=1
// ===
// #000000ff
// #ffffffff

// 1 1 1 1 1 1
// 1 2 2 2 2 1
// 1 2 2 2 2 1
// 1 2 2 1 1 1
// 1 2 2 1 0 0
// 1 1 1 1 0 0
// `.trimStart())

let cursor = defaultCursor

console.log(fs.drives())
console.log(fs.list('sys/'))
console.log(fs.get('sys/crt34.font'))
