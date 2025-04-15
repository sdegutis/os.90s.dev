import * as api from "/api.js"
await api.appReady

const desktopSize = api.sys.$size.adapt(s => ({ ...s, h: s.h - 10 }), api.sizeEquals)
api.sys.setWorkspaceArea({ x: 0, y: 0 }, desktopSize.val)

await api.program.becomeShell()

const $panels = api.$<{
  title: string,
  id: number,
  pid: number,
  focused: boolean,
  point: api.Point,
  size: api.Size,
}[]>([])

const $focused = $panels.adapt(panels => {
  const focused = panels.find(p => p.focused)
  if (!focused) return panels

  return panels
    .toSpliced(panels.indexOf(focused), 1)
    .toSpliced(panels.length - 1, 0, focused)
})

const panelSizes = await api.kvs<api.Size>('panelsizes')
const panelPoints = await api.kvs<api.Point>('panelpoints')

function savePanel(id: number) {
  const panel = $panels.val.find(p => p.id === id)
  if (!panel) return

  panelSizes.set(panel.title, panel.size)
}

async function positionPanel(id: number) {
  const panel = $panels.val.find(p => p.id === id)
  if (!panel) return

  const { title, point } = panel

  let cascadedPoint: api.Point | undefined
  if (point.x === 0 && point.y === 0) {
    const from = $focused.val.find(p => p.focused)
    if (from) cascadedPoint = { x: from.point.x + 10, y: from.point.y + 10 }
  }

  const savedSize = await panelSizes.get(title)

  if (cascadedPoint || savedSize) {
    const nextPoint = cascadedPoint ?? point
    const nextSize = savedSize ?? panel.size
    api.sys.adjustPanel(id, nextPoint.x, nextPoint.y, nextSize.w, nextSize.h)
    $panels.val = $panels.val.map(p => p.id === id ? { ...p, point: nextPoint, size: nextSize } : p)
  }
}


const $panelButtons = $panels.adapt(panels =>
  panels.map(p => <api.Button
    background={p.focused ? 0x99000099 : 0x000000ff}
    padding={2}
    onClick={() => {
      if (p.focused) {
        api.sys.hidePanel(p.id)
        // const toFocus = nextToFocus(p.id)
        // if (toFocus) api.sys.focusPanel(toFocus)
      }
      else {
        api.sys.focusPanel(p.id)
      }
    }}
  >
    <api.Label text={p.title} />
  </api.Button>
  )
)

const desktop = await api.sys.makePanel({
  name: 'desktop',
  order: 'bottom',
}, (
  <api.Margin
    size={desktopSize}
    background={api.sysConfig.$bgcolor}
    padding={1}
    paddingColor={0xffffff11}
  />
))

desktop.point = { x: 0, y: 0 }


async function showRun(this: api.Button) {
  const sysApps = await api.fs.getDir('sys/apps/')
  const usrApps = await api.fs.getDir('usr/apps/')
  api.showMenu([
    ...sysApps.map(app => ({ text: app, onClick: () => { api.sys.launch(`sys/apps/${app}`) } })),
    '-',
    ...usrApps.map(app => ({ text: app, onClick: () => { api.sys.launch(`usr/apps/${app}`) } })),
  ], this.screenPoint)
}

const taskbar = await api.sys.makePanel({
  name: 'taskbar',
  order: 'top',
}, (
  <api.SpacedX
    size={api.sys.$size.adapt(s => ({ ...s, h: 10 }), api.sizeEquals)}
    background={0x222222ff}
  >
    <api.GroupX gap={2}>
      <api.Button padding={2} onClick={showRun}>
        <api.Label text="run" />
      </api.Button>
      <api.GroupX gap={2} children={$panelButtons} />
    </api.GroupX>
    <Clock />
  </api.SpacedX>
))

taskbar.$point.defer(api.sys.$size.adapt(s => ({ x: 0, y: s.h - 10 }), api.pointEquals))


const initial = await api.sys.getPanels()
$panels.val = initial
  .filter(p => (p.id !== desktop.id && p.id !== taskbar.id))
  .map(({ pid, id, title, point, size }) =>
    ({ pid, id, title, point, size, focused: false }))


const panelevents = new BroadcastChannel('panelevents')
panelevents.onmessage = (msg => {
  const { type, id } = msg.data as api.PanelEvent
  if (id === desktop.id || id === taskbar.id) return

  if (type === 'new') {
    const { pid, id, title, point, size } = msg.data
    // console.log('new', id, point, size)

    $panels.val = [
      ...$panels.val,
      { pid, id, title, point, size, focused: false },
    ]

    positionPanel(id)
  }
  else if (type === 'adjusted') {
    const { id, point, size } = msg.data
    // console.log('adjusting', id, point, size)
    $panels.val = $panels.val.map(p => p.id === id ? { ...p, point, size } : p)
    savePanel(id)
  }
  else if (type === 'closed') {
    const { id } = msg.data
    const idx = $panels.val.findIndex(p => p.id === id)
    if (idx === -1) return
    $panels.val = $panels.val.toSpliced(idx, 1)
  }
  else if (type === 'focused') {
    const { id } = msg.data
    const idx = $panels.val.findIndex(p => p.id === id)
    if (idx === -1) return
    const panel = $panels.val[idx]
    $panels.val = $panels.val.map(p => ({ ...p, focused: panel === p }))
  }
})

function Clock() {
  let date = false
  let time = api.$('')

  function toggle(this: api.View, b: number) {
    if (b === 2) {
      api.showMenu([
        { text: '320 x 180', onClick: () => { api.sys.resize(320, 180) } },
        { text: '640 x 360', onClick: () => { api.sys.resize(320 * 2, 180 * 2) } },
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
