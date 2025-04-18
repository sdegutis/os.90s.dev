import * as api from '/api.js'
await api.appReady

const $count = api.$(0)
const inc = () => $count.val++

const panel = await api.sys.makePanel({ name: "hello world" },
  <panel size={{ w: 120, h: 70 }}>
    <api.Center>
      <api.GroupY gap={4}>
        <api.Label text='hello world!' />
        <api.GroupX gap={2}>
          <button style='submit' action={inc}>click me</button>
          <api.Label text={$count.adapt(n => `clicked ${n} times`)} />
        </api.GroupX>
      </api.GroupY>
    </api.Center>
  </panel>
)

panel.focusPanel()
