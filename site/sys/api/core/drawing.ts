export class DrawingContext {

  public canvas
  private ctx

  constructor(w = 0, h = 0) {
    this.canvas = new OffscreenCanvas(w, h)
    this.ctx = this.canvas.getContext('2d')!
  }

  fillRect(x: number, y: number, w: number, h: number, c: number) {
    this.ctx.fillStyle = colorFor(c)
    this.ctx.fillRect(x, y, w, h)
  }

  setClipport(x: number, y: number, w: number, h: number) {
    this.ctx.save()
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.translate(x, y)
    this.ctx.beginPath()
    this.ctx.rect(0, 0, w, h)
    this.ctx.clip()
  }

  get alpha() { return this.ctx.globalAlpha }
  set alpha(n) { this.ctx.globalAlpha = n }

  clearClipport() {
    this.ctx.restore()
  }

  drawImage(canvas: CanvasImageSource, x: number, y: number) {
    this.ctx.drawImage(canvas, x, y)
  }

  drawImagePortion(canvas: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) {
    this.ctx.drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh)
  }

}

const colors = new Map<number, string>()

export function colorFor(col: number): string {
  let color = colors.get(col)
  if (!color) colors.set(col, color = '#' + col.toString(16).padStart(8, '0'))
  return color
}
