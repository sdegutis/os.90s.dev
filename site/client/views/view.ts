import { Rect } from "../util/rect.js"

export class View extends Rect {

  background = 0x000000ff

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

  override resize(w: number, h: number) {
    this.canvas.width = this.w = w
    this.canvas.height = this.h = h
    this.draw()
  }

  override move(x: number, y: number) {
    this.x = x
    this.y = y
  }

  draw() {
    this.rectFill(0, 0, this.w, this.h, this.background)
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
    console.log(this.ctx.fillStyle)
    this.ctx.fillRect(x, y, w, h)
  }

}
