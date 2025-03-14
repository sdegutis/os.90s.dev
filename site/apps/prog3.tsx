import { Program } from "../client/core/prog.js"

const prog = new Program()
await prog.init()

const panel1 = await prog.makePanel('normal')
panel1.blit()

// const panel2 = await prog.makePanel('normal')
// panel2.blit()

// setTimeout(() => {
//   panel1.close()
//   panel2.close()
//   // prog.terminate()
// }, 500)
