import { Listener } from "../events.js"

export class View {

  private _x = 0
  get x() { return this._x }
  set x(n: number) { this.move(n, this.y) }

  private _y = 0
  get y() { return this._y }
  set y(n: number) { this.move(this.x, n) }

  private _w = 0
  get w() { return this._w }
  set w(n: number) { this.resize(n, this.h) }

  private _h = 0
  get h() { return this._h }
  set h(n: number) { this.resize(this.w, n) }

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

}
