import { colorFor } from "../client/views/view.js"

export class Bitmap {

  static fromString(s: string) {
    const [top, bottom] = s.split('\n\n')
    const colors = top.split('\n').map(s => parseInt(s.slice(1), 16))
    const lines = bottom.trim().split('\n').map(s => s.split(' ').map(s => parseInt(s, 16)))
    const pixels = lines.flatMap(c => c)
    return new Bitmap(colors, lines[0].length, pixels)
  }

  width: number
  height: number

  private ctx
  private lastcol?: number

  canvas

  constructor(colors: number[], w: number, pixels: number[]) {
    const h = pixels.length / w

    this.width = w
    this.height = h

    const canvas = new OffscreenCanvas(w, h)
    const ctx = canvas.getContext('2d')!

    this.canvas = canvas
    this.ctx = ctx

    let i = 0
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const ci = pixels[i++]
        if (ci > 0) {
          ctx.fillStyle = colorFor(colors[ci - 1])
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }

    ctx.globalCompositeOperation = 'source-atop'
  }

  colorize(col: number) {
    if (this.lastcol === col) return
    this.lastcol = col

    this.ctx.fillStyle = colorFor(col)
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

}
