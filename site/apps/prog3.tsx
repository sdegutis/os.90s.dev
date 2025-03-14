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

// const cs = Array(2000).keys().map(i => {
//   const w = Math.floor(200 / 2 * Math.random()) + 200 / 2
//   const h = Math.floor(150 / 2 * Math.random()) + 150 / 2
//   const canvas = new OffscreenCanvas(w, h)
//   const ctx = canvas.getContext('2d')!

//   const c = 0xffffffff * Math.random()

//   const r = (c >> 24 & 0xff).toString(16).padStart(2, '0')
//   const g = (c >> 16 & 0xff).toString(16).padStart(2, '0')
//   const b = (c >> 8 & 0xff).toString(16).padStart(2, '0')
//   const a = (c & 0xff).toString(16).padStart(2, '0')
//   ctx.fillStyle = `#${r}${g}${b}${a}`
//   ctx.fillRect(0, 0, w, h)

//   return { canvas, ctx }
// }).toArray()

// ontick((d) => {

//   for (const c of cs) {
//     const x = Math.floor(200 * Math.random())
//     const y = Math.floor(150 * Math.random())
//     view.ctx.drawImage(c.canvas, x, y)
//   }

//   console.log(d)

//   panel.blit()

// })
