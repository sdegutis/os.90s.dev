export class Bitmap {

  static fromString(s: string) {
    const [top, bottom] = s.split('\n\n')
    const colors = top.split('\n')
    const lines = bottom.trim().split('\n').map(s => s.split(' ').map(s => parseInt(s, 16)))
    const pixels = lines.flatMap(c => c)
    return new Bitmap(colors, lines[0].length, pixels)
  }

  width: number
  height: number

  private ctx

  canvas

  constructor(colors: string[], w: number, pixels: number[]) {
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
          ctx.fillStyle = colors[ci - 1]
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }

    ctx.globalCompositeOperation = 'source-in'
  }

  colorize(col: string) {
    this.ctx.fillStyle = col
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

}

console.log(parseMeta(`
foo=1
bar.a=2
bar.b=this
===
hello world
this is cool
`.trimStart()))

function parseMeta(str: string) {
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
