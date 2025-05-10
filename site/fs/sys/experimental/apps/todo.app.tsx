import api from '/os/api.js'
await api.preludesFinished

interface Item {
  text: string
  done: api.Ref<boolean>
}

const textModel = new api.TextModel()

const $items = api.$<Item[]>([], api.arrayEquals)

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
            <api.GroupY align={'a'}>
              {$items.adapt<api.View[]>(items => {
                return items.map(item => <ItemView item={item} />)
              }, api.arrayEquals)}
            </api.GroupY>
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

  $items.set([...$items.val, { done: api.$(false), text }])
  textModel.setText('')
}

function clear() {
  $items.set($items.val.filter(it => !it.done.val))
}

function inverse() {
  $items.val.forEach(it => it.done.set(!it.done.val))
}

function ItemView({ item }: { item: Item }) {
  function toggleDone() {
    item.done.set(!item.done.val)
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
