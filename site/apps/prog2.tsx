import { Program } from "../client/core/prog.js"
import { $$ } from "../util/jsx.js"

const prog = new Program()
await prog.init()

const panel = await prog.makePanel('normal', $$(
  <view background={0x00770033} />
))

panel.view.draw()
panel.blit()
