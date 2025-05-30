import { Bitmap } from "../core/bitmap.js"
import { Cursor } from "../core/cursor.js"
import { sys } from "../core/sys.js"

export const xresize = sys.registerCursor('xresize', new Cursor(2, 1, new Bitmap([0x00000099, 0xffffffff], 5, [
  1, 1, 1, 1, 1,
  1, 2, 2, 2, 1,
  1, 1, 1, 1, 1,
])))

export const yresize = sys.registerCursor('yresize', new Cursor(1, 2, new Bitmap([0x00000099, 0xffffffff], 3, [
  1, 1, 1,
  1, 2, 1,
  1, 2, 1,
  1, 2, 1,
  1, 1, 1,
])))
