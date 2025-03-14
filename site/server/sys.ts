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

    canvas.onmousemove = (e) => {
      const x = Math.min(320 - 1, e.offsetX)
      const y = Math.min(180 - 1, e.offsetY)
      if (x === this.mouse.x && y === this.mouse.y) return
      this.mouse.x = x
      this.mouse.y = y
      this.redrawAllPanels()
    }

  }

  redrawAllPanels() {
    this.ctx.clearRect(0, 0, 320, 180)
    for (const panel of Panel.map.values()) {
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
