import * as api from '/api.js'

interface Item {
  text: string
  done: boolean
}

const model = new api.TextModel()

const $items = api.$<Item[]>([])
const $itemViews = $items.adapt<api.View[]>(items => items.map(item => <ItemView item={item} />))

const panel = await api.sys.makePanel({ name: "todo" },
  <panel title='todo' size={{ w: 70, h: 50 }}>
    <api.PanedYA>
      <api.GroupX>
        <api.Button padding={2} onClick={clear}><api.Label text='clear' /></api.Button>
        <api.Button padding={2} onClick={inverse}><api.Label text='inverse' /></api.Button>
      </api.GroupX>
      <api.PanedYB>
        <api.Scroll showh={false}>
          <api.GroupY align={'a'} children={$itemViews} />
        </api.Scroll>
        <api.Border padding={2} background={0x00000033}>
          <api.TextBox model={model} autofocus onEnter={add} />
        </api.Border>
      </api.PanedYB>
    </api.PanedYA>
  </panel>
)

panel.focusPanel()

function add() {
  const text = model.getText()
  if (!text) return

  $items.val = [...$items.val, { done: false, text }]
  model.setText('')
}

function clear() {
  $items.val = $items.val.filter(it => !it.done)
}

function inverse() {
  $items.val.forEach(it => it.done = !it.done)
}

function ItemView({ item }: { item: Item }) {
  function toggleDone() {
    item.done = !item.done
  }

  return (
    <api.Button onClick={toggleDone}>
      <api.GroupX gap={2}>
        <api.Label color={0xffffff77} text={item.done ? 'x' : 'o'} />
        <api.Label text={item.text} />
      </api.GroupX>
    </api.Button>
  )
}
