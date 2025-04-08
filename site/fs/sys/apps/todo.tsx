import * as api from '/api.js'

interface Item {
  text: string
  done: boolean
}

const textfield = <api.TextBox autofocus multiline={false} onEnter={add} /> as api.TextBox

const $items = api.$<Item[]>([])
const $itemViews = $items.adapt<api.View[]>(items => items.map(item => <ItemView item={item} />))

const panel = await api.Panel.create({ name: "todo" },
  <api.PanelView title={api.$('todo')} size={api.$({ w: 70, h: 50 })}>
    <api.PanedYA>
      <api.GroupX>
        <api.Button padding={2} onClick={clear}><api.Label text='clear' /></api.Button>
        <api.Button padding={2} onClick={inverse}><api.Label text='inverse' /></api.Button>
      </api.GroupX>
      <api.PanedYB>
        <api.Scroll showh={false}>
          <api.GroupY align={'a'} $children={$itemViews} />
        </api.Scroll>
        <api.Border padding={2} background={0x00000033}>
          {textfield}
        </api.Border>
      </api.PanedYB>
    </api.PanedYA>
  </api.PanelView>
)

panel.focusPanel()

function add() {
  const text = textfield.text
  if (!text) return

  $items.val = [...$items.val, { done: false, text }]
  textfield.text = ''
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
