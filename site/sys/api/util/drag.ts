import type { Ref } from "../core/ref.js"
import type { Point, Size } from "../core/types.js"

export function dragMove(mouse: Ref<Point>, point: Ref<Point>) {
  const start = point.val
  const offx = mouse.val.x - start.x
  const offy = mouse.val.y - start.y
  return mouse.watch(() => {
    const diffx = mouse.val.x - start.x
    const diffy = mouse.val.y - start.y
    const x = start.x + diffx - offx
    const y = start.y + diffy - offy
    point.val = { x, y }
  })
}

export function dragResize(mouse: Ref<Point>, size: Ref<Size>) {
  const start = size.val
  const offx = mouse.val.x - start.w
  const offy = mouse.val.y - start.h
  return mouse.watch(() => {
    const diffx = mouse.val.x - start.w
    const diffy = mouse.val.y - start.h
    const w = start.w + diffx - offx
    const h = start.h + diffy - offy
    size.val = { w, h }
  })
}
