export class View {

  background = 0x000000ff

  private _x = 0;
  get x() { return this._x }
  set x(n: number) {
    if (this.x !== n) this.move(this._x = n, this.y)
  }

  private _y = 0;
  get y() { return this._y }
  set y(n: number) {
    if (this.y !== n) this.move(this.x, this._y = n)
  }

  private _w = 0;
  get w() { return this._w }
  set w(n: number) {
    if (this.w !== n) this.resize(this._w = n, this.h)
  }

  private _h = 0;
  get h() { return this._h }
  set h(n: number) {
    if (this.h !== n) this.resize(this.w, this._h = n)
  }

  private _children: View[] = []
  get children(): readonly View[] { return this._children }
  set children(array: View[]) {
    const pre = new Set(this._children)
    const post = new Set(array)
    this._children = array
    const added = post.difference(pre)
    const removed = pre.difference(post)
  }

  parent?: View

  readonly canvas = new OffscreenCanvas(0, 0)
  readonly ctx = this.canvas.getContext('2d')!

  init?(): void

  resize(w: number, h: number) {
    this.canvas.width = this.w = w
    this.canvas.height = this.h = h
    this.draw()
  }

  move(x: number, y: number) {
    this.x = x
    this.y = y
  }

  draw() {
    if ((this.background & 0x000000ff) > 0) {
      this.rectFill(0, 0, this.w, this.h, this.background)
    }
    // for (const child of this.children) {
    //   this.ctx.drawImage(child.canvas, child.x, child.y)
    // }
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
