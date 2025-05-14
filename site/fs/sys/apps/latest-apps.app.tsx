import api from '/os/api.js'
await api.preludesFinished

const panel = await api.sys.makePanel({ name: "latest apps" },
  <panel size={{ w: 120, h: 70 }}>
    <api.Center>
      <api.Label text='coming soon' />
    </api.Center>
  </panel>
)

panel.focusPanel()
