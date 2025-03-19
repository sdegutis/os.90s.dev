import { Program } from "../client/core/prog.js"
import { $ } from "../client/util/ref.js"

const prog = new Program()
await prog.init()

const desktop = await prog.makePanel({
  order: 'bottom',
  pos: [0, 0],
  size: [prog.width, prog.height - 8],
  view: (
    <view background={0x333333ff} />
  )
})

const taskbar = await prog.makePanel({
  order: 'top',
  size: [prog.width, 8],
  pos: [0, prog.height - 8],
  view: (
    <spacedx background={0x444444ff}>
      <groupx></groupx>
      <Clock />
    </spacedx>
  )
})

function Clock() {
  let time = $('')
  const udpateTime = () => time.val = new Date().toLocaleTimeString()
  setInterval(udpateTime, 1000)
  udpateTime()
  return (
    <border padding={2}>
      <label text={time} />
    </border>
  )
}
