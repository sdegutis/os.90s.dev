import * as api from "/api.js"
await api.sys.init(self)

const $lines = api.$<api.View[]>([])
const textarea = <api.Textarea autofocus multiline={false} onEnter={submit} /> as api.Textarea
const context = {}

function append(view: api.View) {
  $lines.val = [...$lines.val, view]
}

function submit() {
  let toeval = textarea.text
  textarea.text = ''

  append(<api.Label text={toeval} />)

  if (!toeval.match(/^(const|var|let)/)) toeval = `return ${toeval}`
  try {
    const fn = new Function(toeval)
    const res = fn.apply(context)
    append(<api.Label text={'> ' + res} />)
  }
  catch (e: any) {
    append(<api.Label text={e.toString()} textColor={0x99000099} />)
  }
}

const panel = await api.Panel.create({ name: "terminal" },
  <api.PanelView title={api.$('terminal')} size={api.$({ w: 100, h: 70 })}>
    <api.Scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      <api.GroupY align={'a'} $children={$lines.adapt(ls => [...ls, textarea])} />
    </api.Scroll>
  </api.PanelView>
)

panel.focusPanel()
