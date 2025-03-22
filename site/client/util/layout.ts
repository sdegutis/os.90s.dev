import type { View } from "../views/view.js"

export function vacuumFirstChild(this: View) {
  const c = this.firstChild
  if (c) {
    c.point = { x: 0, y: 0 }
    c.size = this.size
  }
}
