sys.procbegan.watch(async pid => {
  const port = await sys.openipc(pid)


})
sys.procended.watch(pid => console.log('ended', pid))
await sys.watchprocs()

sys.launch('user/startup.js')

const desktop = await Panel.create((
  <View size={sys.$size.adapt(s => ({ ...s, h: s.h - 10 }))} background={0x004433ff} />
), {
  order: 'bottom',
  pos: $({ x: 0, y: 0 }),
})

const taskbar = await Panel.create((
  <SpacedX size={sys.$size.adapt(s => ({ ...s, h: 10 }))} background={0x000000dd}>
    <GroupX></GroupX>
    <Clock />
  </SpacedX>
), {
  order: 'top',
  pos: sys.$size.adapt(s => ({ x: 0, y: s.h - 10 })),
})

function Clock() {
  let date = false
  let time = $('')

  function toggle(this: View, b: number) {
    if (b === 2) {
      showMenu([
        { text: '320 x 180', onClick: () => { sys.resize(320, 180) } },
        { text: '640 x 360', onClick: () => { sys.resize(320 * 2, 180 * 2) } },
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
    time.val = (date ? d.toLocaleString() : d.toLocaleTimeString()).toLowerCase()
  }

  setInterval(udpateTime, 1000)
  udpateTime()

  return (
    <Button padding={2} canMouse onClick={toggle}>
      <Label text={time} />
    </Button>
  )
}
