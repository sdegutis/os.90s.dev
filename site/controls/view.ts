import { Listener } from "../events.js"

export class View {

  x = 0
  y = 0
  w = 0
  h = 0

  children: readonly View[] = []
  parent?: View

  readonly canvas = new OffscreenCanvas(0, 0)
  readonly ctx = this.canvas.getContext('2d')!

  readonly resized = new Listener<View>()
  readonly moved = new Listener<View>()

  init?(): void

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

  changed(key: string, val: any) {
    console.log('changed', this, key, val)
  }

}
