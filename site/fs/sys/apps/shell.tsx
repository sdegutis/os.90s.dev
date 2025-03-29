import * as api from "/api.js"

api.sys.launch('user/startup.js')

const desktop = await api.Panel.create((
  <api.View size={api.sys.$size.adapt(s => ({ ...s, h: s.h - 10 }))} background={0x004433ff} />
), {
  order: 'bottom',
  pos: api.$({ x: 0, y: 0 }),
})

const taskbar = await api.Panel.create((
  <api.SpacedX size={api.sys.$size.adapt(s => ({ ...s, h: 10 }))} background={0x000000dd}>
    <api.GroupX></api.GroupX>
    <Clock />
  </api.SpacedX>
), {
  order: 'top',
  pos: api.sys.$size.adapt(s => ({ x: 0, y: s.h - 10 })),
})

function Clock() {
  let date = false
  let time = api.$('')

  function toggle(this: api.View, b: number) {
    if (b === 2) {
      api.showMenu([
        { text: '320 x 180', onClick: () => { api.sys.resize(320, 180) } },
        { text: '640 x 360', onClick: () => { api.sys.resize(320 * 2, 180 * 2) } },
        '-',
        { text: 'test dialog', onClick: () => { api.showDialog('testing dialog box') } },
        { text: 'test prompt', onClick: () => { api.showPrompt('testing prompt') } },
      ])
      return
    }

    date = !date
    udpateTime()
  }

  const udpateTime = () => {
    const d = new Date()
    time.val = (date ? d.toLocaleString() : d.toLocaleTimeString()).toLowerCase()
  }

  setInterval(udpateTime, 1000)
  udpateTime()

  return (
    <api.Button padding={2} canMouse onClick={toggle}>
      <api.Label text={time} />
    </api.Button>
  )
}
