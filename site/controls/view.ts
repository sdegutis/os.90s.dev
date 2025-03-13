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

  resized = new Listener<View>()
  moved = new Listener<View>()

  resize(w: number, h: number) {
    this.canvas = new OffscreenCanvas(this.w = w, this.h = h)
    this.resized.dispatch(this)
  }

  move(x: number, y: number) {
    this.x = x
    this.y = y
    this.moved.dispatch(this)
  }

  draw() {

  }

}
