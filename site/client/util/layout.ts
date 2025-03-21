import type { view } from "../views/view.js"

export function vacuumFirstChild(this: view) {
  const c = this.firstChild
  if (c) {
    c.x = 0
    c.y = 0
    c.w = this.w
    c.h = this.h
  }
}
