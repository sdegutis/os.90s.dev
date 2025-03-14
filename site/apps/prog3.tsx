import { Program } from "../client/core/prog.js"
import { $$ } from "../util/jsx.js"

const prog = new Program()
await prog.init()

const panel = await prog.makePanel({
  order: 'normal',
  w: 100, h: 100,
  view: $$(
    <view background={0x00007733} />
  ),
})

panel.view.draw()
panel.blit()
