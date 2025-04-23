import type { Ref } from "../core/ref.js"
import type { Point, Size } from "../core/types.js"

export function dragMove(mouse: Ref<Point>, point: Ref<Point>) {
  const start = point.$
  const offx = mouse.$.x - start.x
  const offy = mouse.$.y - start.y
  return mouse.watch(() => {
    const diffx = mouse.$.x - start.x
    const diffy = mouse.$.y - start.y
    const x = start.x + diffx - offx
    const y = start.y + diffy - offy
    point.$ = { x, y }
  })
}

export function dragResize(mouse: Ref<Point>, size: Ref<Size>) {
  const start = size.$
  const offx = mouse.$.x - start.w
  const offy = mouse.$.y - start.h
  return mouse.watch(() => {
    const diffx = mouse.$.x - start.w
    const diffy = mouse.$.y - start.h
    const w = start.w + diffx - offx
    const h = start.h + diffy - offy
    size.$ = { w, h }
  })
}
