export function bitmapFromString(s: string) {
  const [top, bottom] = s.split('\n\n')
  const colors = top.split('\n').map(s => '#' + s)
  const lines = bottom.trim().split('\n').map(s => s.split(' ').map(s => parseInt(s, 16)))

  const pixels: number[] = []
  for (const line of lines) {
    for (const c of line) {
      pixels.push(c)
    }
  }

  const w = lines[0].length
  const h = pixels.length / w

  const canvas = new OffscreenCanvas(w, h)
  const ctx = canvas.getContext('2d')!

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

  function colorize(col: string) {
    ctx.fillStyle = col
    ctx.fillRect(0, 0, w, h)
  }

  return { canvas, colorize }
}
