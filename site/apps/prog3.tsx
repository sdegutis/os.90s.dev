import { Program } from "../client/core/prog.js"
import { ontick } from "../client/util/ontick.js"

const prog = new Program()
await prog.init()

const view = (
  <view background={0x00007733} />
)

const panel = await prog.makePanel({
  size: [320 / 2, 180 / 2],
  view: view,
})





await new Promise(r => { })



const ctx = panel.ctx

setTimeout(ontick((d) => {

  for (let i = 0; i < 50_000; i++) {
    const x = Math.floor((panel.w - 1) * Math.random())
    const y = Math.floor((panel.h - 1) * Math.random())
    const w = 1//Math.floor((100 - 8) * Math.random())
    const h = 1//Math.floor((100 - 8) * Math.random())
    const c = Math.floor(0xffffffff * Math.random())

    ctx.fillStyle = '#' + c.toString(16).padStart(8, '0')
    ctx.fillRect(x, y, w, h)
  }

  console.log(d)

  panel.blit()

}, 60), 5000)
