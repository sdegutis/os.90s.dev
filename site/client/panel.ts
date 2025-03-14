import { type progRPC } from "../shared/rpc.js"

type Rpc = ReturnType<typeof progRPC>

export class Panel {

  static map = new Map<number, Panel>()

  rpc
  id
  x
  y
  w
  h

  constructor(rpc: Rpc, id: number, x: number, y: number, w: number, h: number) {
    Panel.map.set(id, this)

    this.rpc = rpc
    this.id = id
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  move(x: number, y: number) {
    this.x = x
    this.y = y
    this.rpc.send('adjpanel', [this.id, this.x, this.y, this.w, this.h])
  }

  resize(w: number, h: number) {
    this.w = w
    this.h = h
    this.rpc.send('adjpanel', [this.id, this.x, this.y, this.w, this.h])
    this.blit()
  }

  blit() {
    const canvas = new OffscreenCanvas(this.w, this.h)
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = ({
      '/apps/desktop.js': '#333',
      '/apps/prog1.js': '#900',
      '/apps/prog2.js': '#090',
      '/apps/prog3.js': '#009',
    })[location.pathname]!

    ctx.fillRect(0, 0, this.w, this.h)
    const bmp = canvas.transferToImageBitmap()
    this.rpc.send('blitpanel', [this.id, bmp], [bmp])
  }

  onFocus() {

  }

  onBlur() {

  }

}
