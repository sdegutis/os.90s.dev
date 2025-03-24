import { program } from "../client/core/prog.js"
import { showMenu } from "../client/util/menu.js"
import type { View } from "../client/views/view.js"
import { $ } from "../shared/ref.js"

program.$size.watch(s => {
  console.log(s)
})

const desktopSize = program.$size.adapt(s => ({ ...s, h: s.h - 8 }))
const desktop = await program.makePanel({
  order: 'bottom',
  pos: $({ x: 0, y: 0 }),
  size: desktopSize,
  view: (
    <view size={desktopSize} background={0x333333ff} />
  )
})

const taskbarSize = program.$size.adapt(s => ({ ...s, h: 8 }))
const taskbar = await program.makePanel({
  order: 'top',
  size: taskbarSize,
  pos: program.$size.adapt(s => ({ x: 0, y: s.h - 8 })),
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

  function toggle(this: View, b: number) {
    if (b === 2) {
      showMenu(this.panel!.absmouse, [
        { text: 'test1', onClick: () => { console.log('test1') } },
        { text: 'test2', onClick: () => { console.log('test2') } },
        { text: 'test3', onClick: () => { console.log('test3') } },
        '-',
        { text: 'test4', onClick: () => { console.log('test4') } },
      ])
      return
    }

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
