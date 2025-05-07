import api from '/api.js'
await api.preludesFinished

interface Item {
  text: string
  done: api.Ref<boolean>
}

const textModel = new api.TextModel()

const $items = api.$<Item[]>([], api.arrayEquals)
const $itemViews = $items.adapt<api.View[]>(items => {
  return items.map(item => <ItemView item={item} />)
}, api.arrayEquals)

const panel = await api.sys.makePanel({ name: "todo" },
  <panel size={{ w: 70, h: 50 }}>
    <api.PanedYA gap={2}>
      <api.GroupX gap={2}>
        <button action={clear}>clear</button>
        <button action={inverse}>inverse</button>
      </api.GroupX>
      <api.PanedYB>
        <api.Scroll showh={false} background={0xffffff33}>
          <api.Border padding={2}>
            <api.GroupY align={'a'} children={$itemViews} />
          </api.Border>
        </api.Scroll>
        <api.Border padding={2} background={0x00000033}>
          <api.TextBox model={textModel} autofocus onEnter={add} />
        </api.Border>
      </api.PanedYB>
    </api.PanedYA>
  </panel>
)

panel.focusPanel()

function add() {
  const text = textModel.getText()
  if (!text) return

  $items.$ = [...$items.$, { done: api.$(false), text }]
  textModel.setText('')
}

function clear() {
  $items.$ = $items.$.filter(it => !it.done.$)
}

function inverse() {
  $items.$.forEach(it => it.done.$ = !it.done.$)
}

function ItemView({ item }: { item: Item }) {
  function toggleDone() {
    item.done.$ = !item.done.$
  }

  const $color = item.done.adapt<number>(done => done ? 0xffffff33 : 0xffffff77)
  const $marker = item.done.adapt<string>(done => done ? 'x' : 'o')

  return (
    <api.Button onClick={toggleDone}>
      <api.GroupX gap={2}>
        <api.Label color={$color} text={$marker} />
        <api.Label color={$color} text={item.text} />
      </api.GroupX>
    </api.Button>
  )
}
