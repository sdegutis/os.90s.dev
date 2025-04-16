import * as api from "/api.js"
await api.appReady

const $bgcolor = api.$usrConfig.adapt(config => {
  const c = api.as(config, 'shell.bgcolor', api.as.number)
  return c ?? 0x004433ff
})

const desktopSize = api.sys.$size.adapt(s => ({ ...s, h: s.h - 10 }), api.sizeEquals)
api.sys.setWorkspaceArea({ x: 0, y: 0 }, desktopSize.val)

type Panel = {
  title: string
  id: number
  pid: number
  focused: boolean
  visible: boolean
  point: api.Point
  size: api.Size
}

const $panels = api.$<Panel[]>([])

const savedPanelInfo = await api.kvs<api.Point & api.Size>('panels')

const panelevents = new BroadcastChannel('panelevents')
panelevents.onmessage = (msg => {
  const data = msg.data as api.PanelEvent
  const { type } = data

  if (type === 'new') {
    const { pid, id, title, point, size } = data

    if (pid === api.program.pid) return
    if (title === 'menu') return

    $panels.val = [
      ...$panels.val,
      { pid, id, title, point, size, focused: false, visible: true },
    ]

    positionPanel(id)
  }
  else if (type === 'adjusted') {
    const { id, point, size } = data
    $panels.val = $panels.val.map(p => p.id === id ? { ...p, point, size } : p)
    savePanel(id)
  }
  else if (type === 'toggled') {
    const { id, visible } = data
    $panels.val = $panels.val.map(p => p.id === id ? { ...p, visible } : p)
    savePanel(id)
  }
  else if (type === 'closed') {
    const { id } = data
    const idx = $panels.val.findIndex(p => p.id === id)
    if (idx === -1) return
    $panels.val = $panels.val.toSpliced(idx, 1)
  }
  else if (type === 'focused') {
    const { id } = data
    const idx = $panels.val.findIndex(p => p.id === id)
    if (idx === -1) return
    const panel = $panels.val[idx]
    $panels.val = $panels.val.map(p => ({ ...p, focused: panel === p }))
  }
})

const $focused = $panels.adapt(panels => {
  const focused = panels.find(p => p.focused)
  if (!focused) return panels

  return panels
    .toSpliced(panels.indexOf(focused), 1)
    .toSpliced(panels.length - 1, 0, focused)
})

const initial = await api.sys.getPanels()
$panels.val = initial.filter(p => (p.pid !== api.program.pid))
$panels.val.forEach(p => positionPanel(p.id))

await api.program.becomeShell()



function savePanel(id: number) {
  const panel = $panels.val.find(p => p.id === id)
  if (!panel) return

  const key = keyForPanel(panel)
  const pos = { ...panel.point, ...panel.size }
  savedPanelInfo.set(key, pos)
}

function keyForPanel(panel: Panel) {
  const sameNames = $panels.val.filter(p => p.title === panel.title)
  const idx = sameNames.findIndex(p => p.id === panel.id)
  return `${panel.title}[${idx}]`
}

async function positionPanel(id: number) {
  const panel = $panels.val.find(p => p.id === id)
  if (!panel) return

  let cascadedPoint: api.Point | undefined
  if (panel.point.x === 0 && panel.point.y === 0) {
    const from = $focused.val.findLast(p => p.id !== panel.id)
    if (from) cascadedPoint = { x: from.point.x + 10, y: from.point.y + 10 }
  }

  const saved = await savedPanelInfo.get(keyForPanel(panel))

  if (cascadedPoint || saved) {
    const nextPoint = saved ? saved : (cascadedPoint ?? panel.point)
    const nextSize = saved ?? panel.size

    api.sys.adjustPanel(id, nextPoint.x, nextPoint.y, nextSize.w, nextSize.h)

    $panels.val = $panels.val.map(p => p.id === id ? {
      ...p,
      point: { x: nextPoint.x, y: nextPoint.y },
      size: { w: nextSize.w, h: nextSize.h },
    } : p)
  }

  savePanel(id)
}


const $buttons = $panels.adapt(panels =>
  panels.map(p => {
    return <api.Button
      background={p.focused ? 0x99000099 : 0x000000ff}
      padding={2}
      onClick={() => {
        if (p.focused) {
          api.sys.hidePanel(p.id)

          $panels.val = $panels.val.map(panel => panel.id === p.id ? {
            ...panel,
            visible: false,
            focused: false,
          } : panel)

          const toFocus = $panels.val.findLast(panel => panel !== p && panel.visible)
          if (toFocus) api.sys.focusPanel(toFocus.id)
        }
        else {
          api.sys.focusPanel(p.id)

          $panels.val = $panels.val.map(panel => panel.id === p.id ? {
            ...panel,
            visible: true,
            focused: true,
          } : panel)
        }
      }}
    >
      <api.Label text={p.title} />
    </api.Button>
  }
  )
)

const desktopButtons = <api.GroupY align={'a'} gap={2} />

const desktop = await api.sys.makePanel({
  name: 'desktop',
  order: 'bottom',
}, (
  <api.Margin
    size={desktopSize}
    background={$bgcolor}
    padding={2}
  // paddingColor={0xffffff11}
  >
    {desktopButtons}
  </api.Margin>
))

desktop.point = { x: 0, y: 0 }

const sysApps = await api.fs.getDir('sys/apps/')

desktopButtons.children = sysApps.map(app =>
  <api.Button
    padding={2}
    // background={0xffffff11}
    onClick={() => api.sys.launch(`sys/apps/${app}`)}
  >
    <api.Label text={app} />
  </api.Button>
)

const showRun = () => api.sys.launch('sys/apps/filer.app.js', 'sys/apps/')

const taskbar = await api.sys.makePanel({
  name: 'taskbar',
  order: 'top',
}, (
  <api.SpacedX
    size={api.sys.$size.adapt(s => ({ ...s, h: 10 }), api.sizeEquals)}
    background={0x222222ff}
  >
    <api.GroupX gap={2}>
      <button action={showRun}>run</button>
      <api.GroupX gap={2} children={$buttons} />
    </api.GroupX>
    <api.GroupX gap={2}>
      <Clock />
      <ScreenSize />
    </api.GroupX>
  </api.SpacedX>
))

taskbar.$point.defer(api.sys.$size.adapt(s => ({ x: 0, y: s.h - 10 }), api.pointEquals))



function ScreenSize() {
  const sizes = [
    [320, 180],
    [320 * 2, 180 * 2],
  ]
  const $i = api.$(0)
  const $size = $i.adapt(i => sizes[i])
  const $text = $size.adapt(([w, h]) => `${w} x ${h}`)

  $size.watch(([w, h]) => {
    api.sys.resize(w, h)
  })

  const toggle = () => $i.val = 1 - $i.val
  return <api.Button padding={2} background={0x00000033} onClick={toggle}>
    <api.Label text={$text} />
  </api.Button>
}

function Clock() {
  const $date = api.$(false)
  const $time = api.$(new Date())
  const $text = api.multiplex([$date, $time], () =>
    ($date.val
      ? $time.val.toLocaleString()
      : $time.val.toLocaleTimeString()
    ).toLowerCase())
  setInterval(() => $time.val = new Date(), 1000)
  const toggle = () => $date.val = !$date.val
  return <api.Button padding={2} background={0x00000033} onClick={toggle}>
    <api.Label text={$text} />
  </api.Button>
}
