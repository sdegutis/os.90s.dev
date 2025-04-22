import * as api from '/api.js'
await api.appReady

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

  $items.val = [...$items.val, { done: api.$(false), text }]
  textModel.setText('')
}

function clear() {
  $items.val = $items.val.filter(it => !it.done.val)
}

function inverse() {
  $items.val.forEach(it => it.done.val = !it.done.val)
}

function ItemView({ item }: { item: Item }) {
  function toggleDone() {
    item.done.val = !item.done.val
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
