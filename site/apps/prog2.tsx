import { Program } from "../client/core/prog.js"

const prog = new Program()
await prog.init()

const panel = await prog.makePanel('normal')
panel.blit()
