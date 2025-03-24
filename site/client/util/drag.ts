import type { Ref } from "./ref.js"
import type { Point, Size } from "./types.js"

export function dragMove(anchor: Ref<Point>, o: { point: Point }) {
  const start = o.point
  const offx = anchor.val.x - start.x
  const offy = anchor.val.y - start.y
  return anchor.watch(() => {
    const diffx = anchor.val.x - start.x
    const diffy = anchor.val.y - start.y
    const x = start.x + diffx - offx
    const y = start.y + diffy - offy
    o.point = { x, y }
  })
}

export function dragResize(anchor: Ref<Point>, o: { size: Size }) {
  const start = o.size
  const offx = anchor.val.x - start.w
  const offy = anchor.val.y - start.h
  return anchor.watch(() => {
    const diffx = anchor.val.x - start.w
    const diffy = anchor.val.y - start.h
    const w = start.w + diffx - offx
    const h = start.h + diffy - offy
    o.size = { w, h }
  })
}
