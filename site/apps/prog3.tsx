import { Program } from "../client/core/prog.js"
import { $$ } from "../client/util/jsx.js"

const prog = new Program()
await prog.init()

const panel = await prog.makePanel({
  size: [100, 100],
  view: $$(
    <view background={0x00007733} />
  ),
})
