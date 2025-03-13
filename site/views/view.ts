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

  init?(): void

  resize(w: number, h: number) {
    this.canvas.width = this.w = w
    this.canvas.height = this.h = h
    this.redraw()
  }

  move(x: number, y: number) {
    this.x = x
    this.y = y
  }

  redraw() {
    if ((this.background & 0x000000ff) > 0) {
      this.rectFill(0, 0, this.w, this.h, this.background)
    }
    for (const child of this.children) {
      this.ctx.drawImage(child.canvas, child.x, child.y)
    }
  }

  protected rectFill(x: number, y: number, w: number, h: number, c: number) {
    const r = (c >> 24 & 0xff).toString(16).padStart(2, '0')
    const g = (c >> 16 & 0xff).toString(16).padStart(2, '0')
    const b = (c >> 8 & 0xff).toString(16).padStart(2, '0')
    const a = (c & 0xff).toString(16).padStart(2, '0')
    this.ctx.fillStyle = `#${r}${g}${b}${a}`
    this.ctx.fillRect(x, y, w, h)
  }

}
