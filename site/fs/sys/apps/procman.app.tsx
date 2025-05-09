import api from "/os/api.js"
await api.preludesFinished

const procevents = new api.BC<api.ProcEvent>('procevents', api.sys.sysid)

type Proc = {
  pid: number,
  path: string,
  state: 'starting' | 'ready'
}

const $procs = api.$<Proc[]>([])

const initial = await api.sys.getprocs()
$procs.$ = initial.map(p => ({ state: 'ready', ...p }))

procevents.handle(data => {
  const { pid } = data
  const idx = $procs.$.findIndex(p => p.pid === pid)

  if (data.type === 'started') {
    const { path } = data
    if (idx === -1) $procs.$ = [...$procs.$, ({ pid, path, state: 'starting' })]
  }
  else if (data.type === 'init') {
    const proc = $procs.$[idx]
    if (idx !== -1) $procs.$ = $procs.$.toSpliced(idx, 1, { ...proc, state: 'ready' })
  }
  else if (data.type === 'ended') {
    if (idx !== -1) $procs.$ = $procs.$.toSpliced(idx, 1)
  }
})

const panel = await api.sys.makePanel({ name: "procman" },
  <panel size={{ w: 100, h: 70 }}>
    <api.PanedYA>
      <api.GroupX>
        <button action={async () => {
          const path = await api.showPrompt(panel, 'path to run?')
          if (path) api.sys.launch(path)
        }}>
          run
        </button>
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
  </panel>
)

panel.focusPanel()
