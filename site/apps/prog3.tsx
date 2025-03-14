import { Program } from "../client/core/prog.js"
import { $$ } from "../client/util/jsx.js"

const prog = new Program()
await prog.init()

const view = $$(
  <view background={0x00007733} />
)

const panel = await prog.makePanel({
  size: [400, 300],
  view: view,
})
