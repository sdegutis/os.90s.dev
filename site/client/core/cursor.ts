import { Bitmap } from "./bitmap.js"
import { JSLN } from "./jsln.js"

export class Cursor {

  static readonly NONE = new Cursor(0, 0, new Bitmap([], 1, [0]))

  offx: number
  offy: number
  bitmap: Bitmap

  static fromString(s: string) {
    const o = JSLN.parse(s)
    return new Cursor(
      o["offx"],
      o["offy"],
      Bitmap.fromString(o['colors'], o['pixels'])
    )
  }

  constructor(offx: number, offy: number, bitmap: Bitmap) {
    this.offx = offx
    this.offy = offy
    this.bitmap = bitmap
  }

  toString() {
    return `offx=${this.offx}\noffy=${this.offy}\n===\n${this.bitmap.toString()}`
  }

  draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, px: number, py: number) {
    ctx.drawImage(this.bitmap.canvas, px - this.offx, py - this.offy)
  }

}
