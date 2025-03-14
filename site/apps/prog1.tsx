import { Program } from "../client/core/prog.js"
import { $$ } from "../util/jsx.js"

const prog = new Program()
await prog.init()

const panel = await prog.makePanel('normal', 100, 100, $$(
  <view background={0x77000033} />
))

panel.view.draw()
panel.blit()
