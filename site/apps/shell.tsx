import { Program } from "../client/core/prog.js"
import { $$ } from "../util/jsx.js"

const prog = new Program()
await prog.init()

const desktop = await prog.makePanel('bottom', prog.width, prog.height - 20, $$(
  <view background={0x333333ff} />
))
desktop.move(0, 0)
desktop.view.draw()
desktop.blit()


const taskbar = await prog.makePanel('top', prog.width, 20, $$(
  <view background={0x444444ff} />
))
taskbar.move(0, prog.height - 20)
taskbar.view.draw()
taskbar.blit()
