import * as api from '/api.js'
await api.appReady

const $count = api.$(0)
const inc = () => $count.val++

const panel = await api.sys.makePanel({ name: "hello world" },
  <api.Center size={api.sys.size} background={0x444444ff}>
    <api.GroupY gap={4}>
      <api.Label text='hello world!' />
      <api.GroupX gap={2}>
        <button style='submit' action={inc}>click me</button>
        <api.Label text={$count.adapt(n => `clicked ${n} times`)} />
      </api.GroupX>
    </api.GroupY>
  </api.Center>
)

panel.focusPanel()
