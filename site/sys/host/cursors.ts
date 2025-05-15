import { Cursor } from "../api/core/cursor.js"

export const cursors: Record<string, Cursor> = Object.create(null)

cursors["default"] = Cursor.fromString(`
offx=1
offy=1
colors[]=0x000000ff
colors[]=0xffffffff
pixels=
"""
1 1 1 1
1 2 2 1
1 2 1 1
1 1 1 0
"""
`.trimStart())

cursors['loading'] = Cursor.fromString(`
offx=1
offy=1
colors[]=0x000000ff
colors[]=0xffffffff
pixels=
"""
1 1 1 1 0 0
1 2 2 1 0 0
1 2 1 1 0 0
1 1 1 0 1 0
0 0 0 1 2 1
0 0 0 0 1 0
"""
`.trimStart())
