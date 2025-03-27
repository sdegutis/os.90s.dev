import { Bitmap } from "../client/core/bitmap.js"

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

class DataFile<T> {

  meta: T | null
  data: string

  constructor(contents: string) {
    const [meta, data] = this.parseMeta(contents)
    this.meta = meta
    this.data = data
  }

  private parseMeta(str: string): [T | null, string] {
    const split = str.match(/\n===+\n/)
    if (!split || split.index === undefined) return [null, str]

    const head = str.slice(0, split.index).trim()
    const rest = str.slice(split.index + split[0].length)
    const meta = Object.create(null)

    for (const line of head.split('\n')) {
      const [k, v] = (line.split(/ *= */))

      const parts = k.split('.')
      const last = parts.pop()!

      let node = meta
      for (const p of parts) {
        node = node[p] ??= Object.create(null)
      }

      node[last] = v
    }

    return [meta, rest]
  }

}
