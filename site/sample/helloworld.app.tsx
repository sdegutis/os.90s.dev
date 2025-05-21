import api, { $, Center, GroupX, GroupY, Label } from '/api.js'
await api.preludesFinished

const $count = $(0)
const inc = () => $count.value++

const $color = $(0)
$color.watch(color => console.log('color is', color))

const panel = await api.sys.makePanel({ name: "hello world" },
  <panel size={{ w: 120, h: 120 }}>
    <Center>
      <GroupY gap={4}>
        <Label text='hello world!' />
        <colorpicker $color={$color} />
        <GroupX gap={2}>
          <button style='submit' action={inc}>click me</button>
          <Label text={$count.adapt(n => `clicked ${n} times`)} />
        </GroupX>
      </GroupY>
    </Center>
  </panel>
)

panel.focusPanel()
