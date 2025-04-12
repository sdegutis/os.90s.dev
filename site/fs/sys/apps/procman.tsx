import * as api from "/api.js"

const procevents = new BroadcastChannel('procevents')

type Proc = {
  pid: number,
  path: string,
  state: 'starting' | 'ready'
}

const $procs = api.$<Proc[]>([])

const initial = await api.sys.getprocs()
$procs.val = initial.map(p => ({ state: 'ready', ...p }))

procevents.onmessage = msg => {
  const { pid } = msg.data
  const idx = $procs.val.findIndex(p => p.pid === pid)

  if (msg.data.type === 'started') {
    const { path } = msg.data
    if (idx === -1) $procs.val = [...$procs.val, ({ pid, path, state: 'starting' })]
  }
  else if (msg.data.type === 'init') {
    const proc = $procs.val[idx]
    if (idx !== -1) $procs.val = $procs.val.toSpliced(idx, 1, { ...proc, state: 'ready' })
  }
  else if (msg.data.type === 'ended') {
    if (idx !== -1) $procs.val = $procs.val.toSpliced(idx, 1)
  }
}

const panel = await api.sys.makePanel({ name: "procman" },
  <api.PanelView title='procman' size={{ w: 100, h: 70 }}>
    <api.PanedYA>
      <api.GroupX>
        <api.Button onClick={async () => {
          const path = await api.showPrompt(panel, 'path to run?')
          if (path) api.sys.launch(path)
        }}>
          <api.Label text="run" />
        </api.Button>
      </api.GroupX>
      <api.Scroll background={0xffffff11}>
        <api.GroupY align="a" children={$procs.adapt(procs => (
          procs.map(p => <api.GroupX gap={4}>
            <api.Label text={p.path} />
            <api.Label text={p.pid.toString()} />
            <api.Label text={p.state} />
            <api.Button onClick={() => api.sys.endproc(p.pid)}>
              <api.Label text='terminate' />
            </api.Button>
          </api.GroupX>)
        ))} />
      </api.Scroll>
    </api.PanedYA>
  </api.PanelView>
)

panel.focusPanel()
