import * as api from "/api.js"
await api.appReady

const $bgcolor = api.$usrConfig.adapt(config => {
  const c = api.as(config, 'shell.bgcolor', api.as.number)
  return c ?? 0x004433ff
})

const desktopSize = api.sys.$size.adapt(s => ({ ...s, h: s.h - 10 }), api.sizeEquals)

const setWorkspaceSize = () => api.sys.setWorkspaceArea({ x: 0, y: 0 }, desktopSize.val)
setWorkspaceSize()
desktopSize.watch(setWorkspaceSize)



class Panel {

  $focused
  $visible
  $name

  constructor(
    public name: string,
    public id: number,
    public pid: number,
    public focused: boolean,
    public visible: boolean,
    public point: api.Point,
    public size: api.Size,
  ) {
    this.$focused = api.makeRef(this, 'focused')
    this.$visible = api.makeRef(this, 'visible')
    this.$name = api.makeRef(this, 'name')

    this.$visible.watch(v => {
      if (!v) this.focused = false
    })
  }

  hide() {
    this.visible = false
    this.focused = false
    api.sys.hidePanel(this.id)
  }

  focus() {
    this.visible = true
    this.focused = true
    api.sys.focusPanel(this.id)
  }

  save() {
    savedPanelInfo.set(this.name, { ...this.point, ...this.size })
  }

  async position() {
    let cascadedPoint: api.Point | undefined
    if (this.point.x === 0 && this.point.y === 0) {
      const from = $focused.val.findLast(p => p.id !== this.id)
      if (from) cascadedPoint = { x: from.point.x + 10, y: from.point.y + 10 }
    }

    const saved = await savedPanelInfo.get(this.name)

    if (cascadedPoint || saved) {
      const nextPoint = saved ? saved : (cascadedPoint ?? this.point)
      const nextSize = saved ?? this.size
      this.adjust(nextPoint.x, nextPoint.y, nextSize.w, nextSize.h)
    }

    this.save()
  }

  async reposition() {
    const saved = await savedPanelInfo.get(this.name)
    if (!saved) return

    this.adjust(saved.x, saved.y, saved.w, saved.h)
    this.save()
  }

  adjust(x: number, y: number, w: number, h: number) {
    api.sys.adjustPanel(this.id, x, y, w, h)
    this.point = { x, y }
    this.size = { w, h }
  }

}

const $panels = api.$<Panel[]>([])

const savedPanelInfo = await api.kvs<api.Point & api.Size>('panels')

const panelevents = new BroadcastChannel('panelevents')
panelevents.onmessage = (msg => {
  const data = msg.data as api.PanelEvent
  const { type } = data

  if (type === 'new') {
    const { pid, id, name, point, size, focused, visible } = data

    if (pid === api.program.pid) return
    if (name === 'menu') return

    const panel = new Panel(name, id, pid, focused, visible, point, size)
    $panels.val = [...$panels.val, panel]

    panel.position()

    return
  }

  const panel = findPanel(data.id)
  if (!panel) return

  if (type === 'adjusted') {
    panel.point = data.point
    panel.size = data.size
    panel.save()
  }
  else if (type === 'renamed') {
    panel.name = data.name
    panel.reposition()
  }
  else if (type === 'toggled') {
    panel.visible = data.visible
    panel.save()
  }
  else if (type === 'closed') {
    const idx = $panels.val.findIndex(p => p === panel)
    $panels.val = $panels.val.toSpliced(idx, 1)
  }
  else if (type === 'focused') {
    for (const p of $panels.val) {
      p.focused = p === panel
    }
  }
})

function findPanel(id: number) {
  return $panels.val.find(p => p.id === id)
}

const $focused = $panels.adapt(panels => {
  const focused = panels.find(p => p.focused)
  if (!focused) return panels

  return panels
    .toSpliced(panels.indexOf(focused), 1)
    .toSpliced(panels.length - 1, 0, focused)
})

$panels.val = (await api.sys.getPanels())
  .map(p => new Panel(p.name, p.id, p.pid, p.focused, p.visible, p.point, p.size))
  .filter(p => (p.pid !== api.program.pid))

$panels.val.forEach(p => p.position())

await api.program.becomeShell()


api.sys.onKeyPress.watch(key => {
  if (key === 'ctrl `') {
    const next = $focused.val.findLast(p => !p.focused)
    next?.focus()
  }
})






const $buttons = $panels.adapt(panels =>
  panels.map(p => {
    return <api.Button
      background={p.$focused.adapt<number>(focused => focused ? 0x99000099 : 0x000000ff)}
      padding={2}
      onClick={() => {
        if (p.focused) {
          findPanel(p.id)?.hide()
          const toFocus = $panels.val.findLast(panel => panel !== p && panel.visible)
          if (toFocus) api.sys.focusPanel(toFocus.id)
        }
        else {
          findPanel(p.id)?.focus()
        }
      }}
    >
      <api.Label text={p.$name.adapt(name => name.match(/^[^:]+/)?.[0]!)} />
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

const sysApps = (await api.fs.getDir('sys/apps/'))!

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
  const $text = $size.adapt(([w, h]) => `${w} * ${h}`)

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
