import { Program } from "../client/prog.js"

const prog = new Program()
await prog.init()

const desktop = await prog.makePanel('bottom')
desktop.move(0, 0)
desktop.resize(320, 180)

// const taskbar = await prog.makePanel('bottom')
// taskbar.move(0, 180 - 20)
// taskbar.resize(320, 20)
