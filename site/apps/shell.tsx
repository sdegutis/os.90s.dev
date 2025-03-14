import { Program } from "../client/core/prog.js"
import { $$ } from "../util/jsx.js"

const prog = new Program()
await prog.init()

const desktop = await prog.makePanel('bottom', $$(
  <view background={0x333333ff} />
))
desktop.move(0, 0)
desktop.resize(prog.width, prog.height)
desktop.view.draw()
desktop.blit()


const taskbar = await prog.makePanel('top', $$(
  <view background={0x999999ff} />
))
taskbar.move(0, prog.height - 20)
taskbar.resize(prog.width, 20)
taskbar.view.draw()
taskbar.blit()
