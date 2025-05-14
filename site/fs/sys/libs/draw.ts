import api from "/os/api.js"

export function drawPinStripes(w = 4, h = 3) {
  return function (this: api.View, ...[ctx]: Parameters<api.View['draw']>) {
    this.drawBackground(ctx, this.background)

    let off = 0
    for (let y = 0; y < this.size.h; y++) {
      for (let x = 0; x < this.size.w; x += w) {
        ctx.fillRect(x + off, y, 1, 1, 0xffffff04)
      }
      if (y % h === (h - 1)) off = (off + 1) % w
    }
  }
}
