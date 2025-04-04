export type Point = {
  readonly x: number,
  readonly y: number,
}

export type Size = {
  readonly w: number,
  readonly h: number,
}

export function pointEquals(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y
}

export function sizeEquals(a: Size, b: Size) {
  return a.w === b.w && a.h === b.h
}

export function arrayEquals<T extends ArrayLike<any>>(a: T, b: T) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
