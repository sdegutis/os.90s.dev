export class View {

  background = 0x000000ff

  get x() { return this._x } private _x = 0;
  set x(n: number) { if (this.x !== n) this.move(this._x = n, this.y) }

  get y() { return this._y } private _y = 0;
  set y(n: number) { if (this.y !== n) this.move(this.x, this._y = n) }

  get w() { return this._w } private _w = 0;
  set w(n: number) { if (this.w !== n) this.resize(this._w = n, this.h) }

  get h() { return this._h } private _h = 0;
  set h(n: number) { if (this.h !== n) this.resize(this.w, this._h = n) }

  children: readonly View[] = []
  parent?: View

  readonly canvas = new OffscreenCanvas(0, 0)
  readonly ctx = this.canvas.getContext('2d')!

  // readonly resized = new Listener<View>()
  // readonly moved = new Listener<View>()

  init?(): void

  resize(w: number, h: number) {
    this.canvas.width = this.w = w
    this.canvas.height = this.h = h
    this.redraw()
    // this.resized.dispatch(this)
  }

  move(x: number, y: number) {
    this.x = x
    this.y = y
    // this.moved.dispatch(this)
  }

  redraw() {
    // this.ctx.fillStyle = '#' + Math.floor(Math.random() * 5).toString(16).repeat(3)
    // this.ctx.fillRect(0, 0, this.w, this.h)
  }

}
