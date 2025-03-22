import type { Point } from "../views/view.js"

type Size = {
  readonly w: number,
  readonly h: number,
}

interface Movable extends Point {
  move(x: number, y: number): void
}

interface Resizable {
  size: Size
}

export function dragMove(pos: Point, o: Movable) {
  const startPos = { x: o.x, y: o.y }
  const offx = pos.x - startPos.x
  const offy = pos.y - startPos.y
  return () => {
    const diffx = pos.x - startPos.x
    const diffy = pos.y - startPos.y
    const x = startPos.x + diffx - offx
    const y = startPos.y + diffy - offy
    o.move(x, y)
  }
}

export function dragResize(size: Point, o: Resizable) {
  const startPos = { w: o.size.w, h: o.size.h }
  const offx = size.x - startPos.w
  const offy = size.y - startPos.h
  return () => {
    const diffx = size.x - startPos.w
    const diffy = size.y - startPos.h
    const w = startPos.w + diffx - offx
    const h = startPos.h + diffy - offy
    o.size = { w, h }
  }
}
