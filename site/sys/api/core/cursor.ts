import { Bitmap } from "./bitmap.js"
import { JSLN } from "./jsln.js"

export class Cursor {

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

  toJsln() {
    return {
      offx: this.offx,
      offy: this.offy,
      ...this.bitmap.toJsln(),
    }
  }

  draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, px: number, py: number) {
    ctx.drawImage(this.bitmap.canvas, px - this.offx, py - this.offy)
  }

}
