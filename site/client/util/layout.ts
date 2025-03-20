import type { view } from "../views/view.js"

export function vacuumFirstChild(this: view) {
  this.firstChild?.mutate(v => {
    v.x = 0
    v.y = 0
    v.w = this.w
    v.h = this.h
  })
}
