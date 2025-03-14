import { prog } from "../client/prog.js"

const panel = await prog.makePanel()
panel.move(0, 0)
panel.resize(320, 180)
