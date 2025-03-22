import { Bitmap } from "../../shared/bitmap.js"
import { Cursor } from "../../shared/cursor.js"
import type { view } from "../views/view.js"

export const xresize = new Cursor(2, 1, new Bitmap([0x00000099, 0xffffffff], 5, [
  1, 1, 1, 1, 1,
  1, 2, 2, 2, 1,
  1, 1, 1, 1, 1,
]))

export const yresize = new Cursor(1, 2, new Bitmap([0x00000099, 0xffffffff], 3, [
  1, 1, 1,
  1, 2, 1,
  1, 2, 1,
  1, 2, 1,
  1, 1, 1,
]))

export function useCursor(view: view, cursor: Cursor) {
  let claims = 0
  const push = () => { if (++claims === 1) view.panel?.setCursor(cursor) }
  const pop = () => { if (--claims === 0) view.panel?.setCursor(null) }
  return { push, pop }
}
