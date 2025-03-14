import type { KeyMap } from "../shared/rpc.js"
import { setupCanvas } from "../util/canvas.js"
import { Panel } from "./panel.js"

const cursor = new OffscreenCanvas(1, 1)
const cursorctx = cursor.getContext('2d')!
cursorctx.fillStyle = '#fff'
cursorctx.fillRect(0, 0, 1, 1)


export class Sys {

  ctx
  mouse = { x: 0, y: 0 }
  keymap: KeyMap = Object.create(null)

  constructor() {
    const { canvas, ctx } = setupCanvas()
    this.ctx = ctx

    let hovered: Panel | null = null
    let focused: Panel | null = null
    let clicking: Panel | null = null

    canvas.onkeydown = (e) => {
      this.keymap[e.key] = true
      focused?.rpc.send('keydown', [e.key])
      this.redrawAllPanels()
    }

    canvas.onkeyup = (e) => {
      delete this.keymap[e.key]
      focused?.rpc.send('keyup', [e.key])
      this.redrawAllPanels()
    }

    canvas.onmousemove = (e) => {
      const x = Math.min(320 - 1, e.offsetX)
      const y = Math.min(180 - 1, e.offsetY)

      if (x === this.mouse.x && y === this.mouse.y) return
      this.mouse.x = x
      this.mouse.y = y

      const newhovered = this.findHovered()

      if (newhovered !== hovered) {
        hovered?.rpc.send('mouseexited', [])
        hovered = newhovered
        hovered?.rpc.send('mouseentered', [])
      }

      const sendto = clicking ?? hovered
      sendto?.rpc.send('mousemoved', [this.mouse.x, this.mouse.y])

      this.redrawAllPanels()
    }

    canvas.onmousedown = (e) => {
      if (!hovered) return

      if (focused !== hovered) {
        focused?.rpc.send('blur', [])
        focused = hovered
        focused.rpc.send('focus', [this.keymap])
      }

      if (hovered.pos === 'normal') {
        const oldi = Panel.ordered.indexOf(hovered)
        const newi = Panel.ordered.findLastIndex(p => p.pos !== 'top')

        Panel.ordered.splice(oldi, 1)
        Panel.ordered.splice(newi, 0, hovered)
      }

      clicking = hovered
      clicking.rpc.send('mousedown', [e.button])
      this.redrawAllPanels()
    }

    canvas.onmouseup = (e) => {
      clicking?.rpc.send('mouseup', [])
      clicking = null
      this.redrawAllPanels()
    }

    canvas.onwheel = (e) => {
      hovered?.rpc.send('wheel', [e.deltaY])
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
    this.ctx.clearRect(0, 0, 320, 180)
    for (const panel of Panel.ordered) {
      if (panel.img) {
        this.ctx.drawImage(panel.img, panel.x, panel.y)
      }
    }
    this.drawCursor()
  }

  private drawCursor() {
    this.ctx.drawImage(cursor, this.mouse.x, this.mouse.y)
  }

}
