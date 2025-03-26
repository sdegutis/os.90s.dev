import { colorFor } from "./colors.js"

export class DrawingContext {

  private ctx: OffscreenCanvasRenderingContext2D

  constructor(ctx: OffscreenCanvasRenderingContext2D) {
    this.ctx = ctx
  }

  fillRect(x: number, y: number, w: number, h: number, c: number) {
    this.ctx.fillStyle = colorFor(c)
    this.ctx.fillRect(x, y, w, h)
  }

  strokeRect(x: number, y: number, w: number, h: number, c: number) {
    this.ctx.strokeStyle = colorFor(c)
    this.ctx.strokeRect(x + .5, y + .5, w - 1, h - 1)
  }

  clip(x: number, y: number, w: number, h: number) {
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.rect(x, y, w, h)
    this.ctx.clip()
  }

  unclip() {
    this.ctx.restore()
  }

  drawImage(canvas: OffscreenCanvas, x: number, y: number) {
    this.ctx.drawImage(canvas, x, y)
  }

  drawImagePortion(canvas: OffscreenCanvas, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) {
    this.ctx.drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh)
  }

}
