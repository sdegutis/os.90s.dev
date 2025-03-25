import { Panel } from "../client/core/panel.js"
import { program } from "../client/core/prog.js"
import { showDialog } from "../client/util/dialog.js"
import { showMenu } from "../client/util/menu.js"
import { showPrompt } from "../client/util/prompt.js"
import type { View } from "../client/views/view.js"
import { $ } from "../shared/ref.js"

const desktop = await Panel.create((
  <view size={program.$size.adapt(s => ({ ...s, h: s.h - 8 }))} background={0x333333ff} />
), {
  order: 'bottom',
  pos: $({ x: 0, y: 0 }),
})

const taskbar = await Panel.create((
  <spacedx size={program.$size.adapt(s => ({ ...s, h: 8 }))} background={0x000000dd}>
    <groupx></groupx>
    <Clock />
  </spacedx>
), {
  order: 'top',
  pos: program.$size.adapt(s => ({ x: 0, y: s.h - 8 })),
})

function Clock() {
  let date = false
  let time = $('')

  function toggle(this: View, b: number) {
    if (b === 2) {
      showMenu(this.panel!.absmouse, [
        { text: '320 x 180', onClick: () => { program.resize(320, 180) } },
        { text: '640 x 360', onClick: () => { program.resize(320 * 2, 180 * 2) } },
        '-',
        { text: 'test dialog', onClick: () => { showDialog('testing dialog box') } },
        { text: 'test prompt', onClick: () => { showPrompt('testing prompt') } },
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
