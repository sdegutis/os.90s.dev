import * as api from "/api.js"

await api.program.becomeShell()

const $panels = api.$<{
  title: string,
  id: number,
  pid: number,
  focused: boolean,
}[]>([])

const panelevents = new BroadcastChannel('panelevents')
panelevents.onmessage = msg => {
  const { type, pid, id, title } = msg.data
  if (pid === api.program.pid) return

  if (type === 'new') {
    $panels.val = [
      ...$panels.val.map(p => ({ ...p, focused: false })),
      { pid, id, title, focused: true },
    ]
  }
  else if (type === 'closed') {
    const idx = $panels.val.findIndex(p => p.id === id)
    if (idx === -1) return
    $panels.val = $panels.val.toSpliced(idx, 1)
  }
  else if (type === 'focused') {
    const idx = $panels.val.findIndex(p => p.id === id)
    if (idx === -1) return
    const panel = $panels.val[idx]
    $panels.val = $panels.val.map(p => ({ ...p, focused: panel === p }))
  }
}


const $panelButtons = $panels.adapt(panels =>
  panels.map(p =>
    <api.Button background={p.focused ? 0x99000099 : 0x000000ff} padding={2} onClick={() => { api.sys.focusPanel(p.id) }}>
      <api.Label text={p.title} />
    </api.Button>
  )
)

// const config = await api.getConfigs()
// config['']
const bgcolor = 0x004433ff

const desktop = await api.Panel.create({
  name: 'desktop',
  saveSize: false,
  order: 'bottom',
  pos: api.$({ x: 0, y: 0 }),
}, (
  <api.View size={api.sys.$size.adapt(s => ({ ...s, h: s.h - 10 }))} background={bgcolor} />
))

async function showRun(this: api.Button) {
  const sysApps = await api.fs.getDir('sys/apps/')
  const usrApps = await api.fs.getDir('usr/apps/')
  api.showMenu([
    ...sysApps.map(app => ({ text: app, onClick: () => { api.sys.launch(`sys/apps/${app}`) } })),
    '-',
    ...usrApps.map(app => ({ text: app, onClick: () => { api.sys.launch(`usr/apps/${app}`) } })),
  ], this.screenPoint)
}

const taskbar = await api.Panel.create({
  name: 'taskbar',
  saveSize: false,
  order: 'top',
  pos: api.sys.$size.adapt(s => ({ x: 0, y: s.h - 10 })),
}, (
  <api.SpacedX size={api.sys.$size.adapt(s => ({ ...s, h: 10 }))} background={0x222222ff}>
    <api.GroupX gap={2}>
      <api.Button padding={2} onClick={showRun}>
        <api.Label text="run" />
      </api.Button>
      <api.GroupX gap={2} children={$panelButtons} />
    </api.GroupX>
    <Clock />
  </api.SpacedX>
))

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
