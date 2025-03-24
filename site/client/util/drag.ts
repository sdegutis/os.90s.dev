import type { Point, Size } from "./types.js"

export function dragMove(anchor: Point, o: { point: Point }) {
  const startPos = { x: o.point.x, y: o.point.y }
  const offx = anchor.x - startPos.x
  const offy = anchor.y - startPos.y
  return () => {
    const diffx = anchor.x - startPos.x
    const diffy = anchor.y - startPos.y
    const x = startPos.x + diffx - offx
    const y = startPos.y + diffy - offy
    o.point = { x, y }
  }
}

export function dragResize(anchor: Point, o: { size: Size }) {
  const startPos = { w: o.size.w, h: o.size.h }
  const offx = anchor.x - startPos.w
  const offy = anchor.y - startPos.h
  return () => {
    const diffx = anchor.x - startPos.w
    const diffy = anchor.y - startPos.h
    const w = startPos.w + diffx - offx
    const h = startPos.h + diffy - offy
    o.size = { w, h }
  }
}
