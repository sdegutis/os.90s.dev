import { Program } from "../client/core/prog.js"
import { $$ } from "../client/util/jsx.js"

const prog = new Program()
await prog.init()

const desktop = await prog.makePanel({
  order: 'bottom',
  pos: [0, 0],
  size: [prog.width, prog.height - 20],
  view: $$(
    <view background={0x333333ff} />
  )
})

const taskbar = await prog.makePanel({
  order: 'top',
  size: [prog.width, 20],
  pos: [0, prog.height - 20],
  view: $$(
    <view background={0x444444ff} />
  )
})
