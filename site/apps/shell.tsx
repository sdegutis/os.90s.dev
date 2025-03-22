import { program } from "../client/core/prog.js"
import { $ } from "../client/util/ref.js"

const desktopSize = $({ w: program.width, h: program.height - 8 })
const desktop = await program.makePanel({
  order: 'bottom',
  pos: $({ x: 0, y: 0 }),
  size: desktopSize,
  view: (
    <view size={desktopSize} background={0x333333ff} />
  )
})

const taskbarSize = $({ w: program.width, h: 8 })
const taskbar = await program.makePanel({
  order: 'top',
  size: taskbarSize,
  pos: $({ x: 0, y: program.height - 8 }),
  view: (
    <spacedx size={taskbarSize} background={0x444444ff}>
      <groupx></groupx>
      <Clock />
    </spacedx>
  )
})

function Clock() {
  let date = false
  let time = $('')

  const toggle = () => {
    date = !date
    udpateTime()
  }

  const udpateTime = () => {
    const d = new Date()
    time.val = date ? d.toLocaleString() : d.toLocaleTimeString()
  }

  setInterval(udpateTime, 1000)
  udpateTime()

  return (
    <button padding={2} passthrough={false} onClick={toggle}>
      <label text={time} />
    </button>
  )
}
