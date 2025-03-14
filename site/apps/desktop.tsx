import { Program } from "../client/core/prog.js"
import { $$ } from "../util/jsx.js"

const prog = new Program()
await prog.init()

const desktop = await prog.makePanel('bottom', $$(
  <view background={0x333333ff} />
).view)

desktop.move(0, 0)
desktop.resize(prog.width, prog.height)

// const taskbar = await prog.makePanel('bottom')
// taskbar.move(0, 180 - 20)
// taskbar.resize(320, 20)
