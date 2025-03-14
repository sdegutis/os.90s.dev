import { setupCanvas } from "../util/canvas.js"
import { Panel } from "./panel.js"

const cursor = new OffscreenCanvas(1, 1)
const cursorctx = cursor.getContext('2d')!
cursorctx.fillStyle = '#fff'
cursorctx.fillRect(0, 0, 1, 1)

export class Sys {

  ctx
  mouse = { x: 0, y: 0 }

  constructor() {
    const { canvas, ctx } = setupCanvas()
    this.ctx = ctx

    let hovered: Panel | null = null
    let focused: Panel | null = null
    let clicking: Panel | null = null

    canvas.onmousemove = (e) => {
      const x = Math.min(320 - 1, e.offsetX)
      const y = Math.min(180 - 1, e.offsetY)

      if (x === this.mouse.x && y === this.mouse.y) return
      this.mouse.x = x
      this.mouse.y = y

      this.redrawAllPanels()

      const newhovered = this.findHovered()

      if (newhovered !== hovered) {
        hovered?.mouseexit()
        hovered = newhovered
        hovered?.mouseenter()
      }

      if (clicking) {
        clicking.mousemove(this.mouse.x, this.mouse.y)
      }
      else {
        hovered?.mousemove(this.mouse.x, this.mouse.y)
      }
    }

    canvas.onmousedown = (e) => {
      if (!hovered) return

      if (focused !== hovered) {
        focused?.blur()
        focused = hovered
        focused.focus()
      }

      if (hovered.pos === 'normal') {
        const oldi = Panel.ordered.indexOf(hovered)
        const newi = Panel.ordered.findLastIndex(p => p.pos !== 'top')

        Panel.ordered.splice(oldi, 1)
        Panel.ordered.splice(newi, 0, hovered)
      }

      clicking = hovered
      clicking.mousedown(e.button)
    }

    canvas.onmouseup = (e) => {
      clicking?.mouseup()
      clicking = null
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
