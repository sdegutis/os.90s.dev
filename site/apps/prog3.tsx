import { Program } from "../client/core/prog.js"

const prog = new Program()
await prog.init()

const view = (
  <view background={0x00007733} />
)

const panel = await prog.makePanel({
  size: [320 / 2, 180 / 2],
  view: view,
})
