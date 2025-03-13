import { Listener } from "../events.js"

export class View {

  constructor(data?: Partial<View>) {
    Object.assign(this, data)
  }

  x = 0
  y = 0
  w = 0
  h = 0

  children: readonly View[] = []
  parent?: View

  canvas = new OffscreenCanvas(0, 0)
  ctx = this.canvas.getContext('2d')!

  resized = new Listener<View>()
  moved = new Listener<View>()

  resize(w: number, h: number) {
    this.canvas.width = this.w = w
    this.canvas.height = this.h = h
    this.redraw()
    this.resized.dispatch(this)
  }

  move(x: number, y: number) {
    this.x = x
    this.y = y
    this.moved.dispatch(this)
  }

  redraw() {
    this.ctx.fillStyle = '#' + Math.floor(Math.random() * 5).toString(16).repeat(3)
    this.ctx.fillRect(0, 0, this.w, this.h)
  }

}
