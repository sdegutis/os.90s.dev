import type { Pos } from "../views/view.js"

interface Movable extends Pos {
  move(x: number, y: number): void
}

export function dragMove(mouse: Pos, o: Movable) {
  const startPos = { x: o.x, y: o.y }
  const offx = mouse.x - startPos.x
  const offy = mouse.y - startPos.y
  return () => {
    const diffx = mouse.x - startPos.x
    const diffy = mouse.y - startPos.y
    const x = startPos.x + diffx - offx
    const y = startPos.y + diffy - offy
    o.move(x, y)
  }
}
