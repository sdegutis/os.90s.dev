import * as api from "/api.js"

const procevents = new BroadcastChannel('procevents')

type Proc = {
  pid: number,
  path: string,
  state: 'starting' | 'ready'
}

const initial = await api.sys.getprocs()

const $procs = api.$<api.Ref<Proc>[]>(
  initial.map(p => api.$<Proc>({
    state: 'ready',
    ...p,
  }))
)

procevents.onmessage = msg => {
  const { pid } = msg.data

  if (msg.data.type === 'started') {
    const { path } = msg.data
    $procs.val = [...$procs.val, api.$<Proc>({ pid, path, state: 'starting' })]
  }
  else if (msg.data.type === 'init') {
    const p = $procs.val.find(p => p.val.pid === pid)
    if (p) p.val = { ...p.val, state: 'ready' }
  }
  else if (msg.data.type === 'ended') {
    const idx = $procs.val.findIndex(p => p.val.pid === pid)
    if (idx !== -1) $procs.val = $procs.val.toSpliced(idx, 1)
  }

}

const panel = await api.Panel.create({ name: "procman" },
  <api.PanelView title={api.$('procman')} size={api.$({ w: 100, h: 70 })}>
    <api.Scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      <api.GroupY align="a" $children={$procs.adapt(procs => (
        procs.map(p => (
          <api.GroupX gap={4}>
            <api.Label text={p.val.path} />
            <api.Label text={p.val.pid.toString()} />
            <api.Label text={p.val.state} />
            <api.Button onClick={() => api.sys.endproc(p.val.pid)}>
              <api.Label text='terminate' />
            </api.Button>
          </api.GroupX>
        ))
      ))} />
    </api.Scroll>
  </api.PanelView>
)

panel.focusPanel()
