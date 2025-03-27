import { Bitmap } from "/shared/bitmap.js"
import { DrawingContext } from "/shared/drawing.js"

export class Font {

  spr: Bitmap
  cw: number
  ch: number
  xgap = 1
  ygap = 2

  constructor(data: string) {
    this.spr = Bitmap.fromString(data)
    this.cw = this.spr.width / 16
    this.ch = this.spr.height / 6
  }

  print(ctx: DrawingContext, x: number, y: number, c: number, text: string) {
    let posx = 0
    let posy = 0

    if (c) this.spr.colorize(c)

    for (const ch of Array.from(text)) {
      if (ch === '\n') {
        posy++
        posx = 0
        continue
      }

      let ci = ch.charCodeAt(0) - 32
      if (ci < 0 || ci > 95) ci = 95
      const sx = ci % 16 * this.cw
      const sy = Math.floor(ci / 16) * this.ch

      const px = x + (posx * (this.cw + this.xgap))
      const py = y + (posy * (this.ch + this.ygap))

      ctx.drawImagePortion(this.spr.canvas, sx, sy, this.cw, this.ch, px, py, this.cw, this.ch)

      posx++
    }
  }

  calcSize(text: string) {
    const lines = text.split('\n')
    const rows = lines.length
    let cols = 0
    for (const line of lines) {
      if (line.length > cols) cols = line.length
    }
    return {
      w: (cols * this.cw) + ((cols - 1) * this.xgap),
      h: (rows * this.ch) + ((rows - 1) * this.ygap),
    }
  }

}

export const crt34 = new Font(`
#ffffffff

0 0 0 0 1 0 1 0 1 1 1 1 0 1 0 0 1 0 1 1 1 1 1 0 0 0 1 0 1 0 1 0 1 0 1 0 0 0 0 0 0 0 0 0 0 0 0 1
0 0 0 0 1 0 1 0 1 1 1 1 1 0 0 0 0 0 1 0 1 0 1 0 0 1 0 0 0 1 0 1 0 1 1 1 0 0 0 1 1 1 0 0 0 0 1 0
0 0 0 0 0 0 0 0 0 1 1 1 0 1 0 1 1 1 1 1 0 0 0 0 0 1 0 0 0 1 1 0 1 0 1 0 0 1 0 0 0 0 0 0 0 0 1 0
0 0 0 0 1 0 0 0 0 0 0 0 1 0 0 0 1 0 1 1 1 0 0 0 0 0 1 0 1 0 0 0 0 0 0 0 1 0 0 0 0 0 0 1 0 1 0 0
0 1 0 1 1 0 1 1 0 1 1 1 1 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 1 0 0 1 0 1 1 0 1 0 0 1 1 1
1 0 1 0 1 0 0 0 1 0 1 1 1 0 1 1 1 0 1 0 0 0 0 1 1 1 1 1 0 1 0 0 0 0 0 0 1 0 0 0 0 0 0 1 0 1 0 1
1 0 1 0 1 0 0 1 0 0 0 1 1 1 1 0 0 1 1 1 1 0 0 1 1 0 1 0 1 1 1 0 0 0 1 0 0 1 0 1 1 0 1 0 0 0 0 0
0 1 0 1 1 1 1 1 1 1 1 1 0 0 1 1 1 0 1 1 1 0 0 1 1 1 1 1 1 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 1
0 1 1 0 1 0 1 1 0 1 1 1 1 1 0 1 1 1 1 1 1 1 1 1 1 0 1 1 1 1 1 1 1 1 0 1 1 0 0 1 1 1 1 1 1 1 1 1
1 0 1 1 0 1 1 1 1 1 0 0 1 0 1 1 1 0 1 1 0 1 0 0 1 1 1 0 1 0 0 1 0 1 1 0 1 0 0 1 1 1 1 0 1 1 0 1
1 0 0 1 1 1 1 0 1 1 0 0 1 0 1 1 0 0 1 0 0 1 0 1 1 0 1 0 1 0 0 1 0 1 1 0 1 0 0 1 0 1 1 0 1 1 0 1
0 1 1 1 0 1 1 1 1 1 1 1 1 1 0 1 1 1 1 0 0 1 1 1 1 0 1 1 1 1 1 1 0 1 0 1 1 1 1 1 0 1 1 0 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 1 1 0 1 1 0 1 1 0 1 1 0 1 1 1 1 0 1 1 1 0 0 1 1 0 0 1 0 0 0 0
1 0 1 1 0 1 1 0 1 1 0 0 0 1 0 1 0 1 1 0 1 1 0 1 0 1 0 1 0 1 0 1 1 0 1 0 0 1 0 0 1 0 1 0 1 0 0 0
1 1 0 1 1 1 1 1 0 0 1 1 0 1 0 1 0 1 1 0 1 1 1 1 0 1 0 0 1 0 1 0 0 0 1 0 0 1 0 0 1 0 0 0 0 0 0 0
1 0 0 0 0 1 1 0 1 1 1 1 0 1 0 1 1 1 0 1 0 1 1 1 1 0 1 0 1 0 1 1 1 0 1 1 0 0 1 1 1 0 0 0 0 1 1 1
1 0 0 0 1 0 1 1 0 1 1 1 1 1 0 1 1 1 1 1 1 1 1 1 1 0 1 1 1 1 1 1 1 1 0 1 1 0 0 1 1 1 1 1 1 1 1 1
0 1 0 1 0 1 1 1 1 1 0 0 1 0 1 1 1 0 1 1 0 1 0 0 1 1 1 0 1 0 0 1 0 1 1 0 1 0 0 1 1 1 1 0 1 1 0 1
0 0 0 1 1 1 1 0 1 1 0 0 1 0 1 1 0 0 1 0 0 1 0 1 1 0 1 0 1 0 0 1 0 1 1 0 1 0 0 1 0 1 1 0 1 1 0 1
0 0 0 1 0 1 1 1 1 1 1 1 1 1 0 1 1 1 1 0 0 1 1 1 1 0 1 1 1 1 1 1 0 1 0 1 1 1 1 1 0 1 1 0 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 1 1 0 1 1 0 1 1 0 1 1 0 1 1 1 1 0 1 1 0 1 0 1 1 0 1 1 0 0 0 0
1 0 1 1 0 1 1 0 1 1 0 0 0 1 0 1 0 1 1 0 1 1 0 1 0 1 0 1 0 1 0 1 1 1 1 0 0 1 0 0 1 1 0 1 1 0 0 0
1 1 0 1 1 1 1 1 0 0 1 1 0 1 0 1 0 1 1 0 1 1 1 1 0 1 0 0 1 0 1 0 0 0 1 0 0 1 0 0 1 0 0 0 0 0 1 0
1 0 0 0 0 1 1 0 1 1 1 1 0 1 0 1 1 1 0 1 0 1 1 1 1 0 1 0 1 0 1 1 1 0 1 1 0 1 0 1 1 0 0 0 0 0 0 0
`.trimStart())
