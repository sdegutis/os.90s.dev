import { Ref } from "../core/ref.js"
import { Point, Size } from "/shared/types.js"

export function dragMove(anchor: Ref<Point>, o: Ref<Point>) {
  const start = o.val
  const offx = anchor.val.x - start.x
  const offy = anchor.val.y - start.y
  return anchor.watch(() => {
    const diffx = anchor.val.x - start.x
    const diffy = anchor.val.y - start.y
    const x = start.x + diffx - offx
    const y = start.y + diffy - offy
    o.val = { x, y }
  })
}

export function dragResize(anchor: Ref<Point>, o: Ref<Size>) {
  const start = o.val
  const offx = anchor.val.x - start.w
  const offy = anchor.val.y - start.h
  return anchor.watch(() => {
    const diffx = anchor.val.x - start.w
    const diffy = anchor.val.y - start.h
    const w = start.w + diffx - offx
    const h = start.h + diffy - offy
    o.val = { w, h }
  })
}
