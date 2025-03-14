export abstract class Rect {

  protected _x = 0;
  get x() { return this._x }
  set x(n: number) {
    if (this._x !== n) this.move(this._x = n, this.y)
  }

  protected _y = 0;
  get y() { return this._y }
  set y(n: number) {
    if (this._y !== n) this.move(this.x, this._y = n)
  }

  protected _w = 0;
  get w() { return this._w }
  set w(n: number) {
    if (this._w !== n) this.resize(this._w = n, this.h)
  }

  protected _h = 0;
  get h() { return this._h }
  set h(n: number) {
    if (this._h !== n) this.resize(this.w, this._h = n)
  }

  abstract move(x: number, y: number): void
  abstract resize(w: number, h: number): void

}
