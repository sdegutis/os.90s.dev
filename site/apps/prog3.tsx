import { Program } from "../client/core/prog.js"

const prog = new Program()
await prog.init()

const panel = await prog.makePanel({
  size: [320 / 2, 180 / 2],
  view: (
    <view background={'#00007733'} />
  ),
})
