import { Bitmap } from "/shared/bitmap.js"
import { DataFile } from "/shared/datafile.js"

export class Cursor {

  static readonly NONE = new Cursor(0, 0, new Bitmap([], 1, [0]))

  offx: number
  offy: number
  bitmap: Bitmap

  static fromString(s: string) {
    const f = new DataFile<{ offx: string, offy: string }>(s)
    return new Cursor(
      parseInt(f.meta!.offx),
      parseInt(f.meta!.offy),
      Bitmap.fromString(f.data)
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
