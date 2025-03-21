import type { view } from "../views/view.js"

export function vacuumFirstChild(this: view) {
  const c = this.firstChild
  if (c) {
    c.point = { x: 0, y: 0 }
    // c.size.w = this.size.w
    // c.size.h = this.size.h
  }
}
