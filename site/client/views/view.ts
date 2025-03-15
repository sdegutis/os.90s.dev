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

  init?(): void

  override resize(w: number, h: number) {
    this.w = w
    this.h = h
  }

  override move(x: number, y: number) {
    this.x = x
    this.y = y
  }

  draw(ctx: OffscreenCanvasRenderingContext2D) {
    ctx.fillStyle = `#${this.background.toString(16).padStart(8, '0')}`
    ctx.fillRect(0, 0, this.w, this.h)
    // for (const child of this.children) {
    //   this.ctx.drawImage(child.canvas, child.x, child.y)
    // }
  }

}
