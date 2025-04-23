import * as api from "/api.js"
await api.appReady

{ (self as any).api = api }

const $lines = api.$<api.View[]>([])
const textarea = <api.TextBox autofocus onEnter={submit} /> as api.TextBox
const context = {}

function append(view: api.View) {
  $lines.$ = [...$lines.$, view]
}

function submit() {
  let toeval = textarea.model.getText()
  textarea.model.setText('')

  append(<api.Label text={toeval} />)

  if (!toeval.match(/^(const|var|let)/)) toeval = `return ${toeval}`
  try {
    const fn = new Function(toeval)
    const res = fn.apply(context)
    append(<api.Label text={'> ' + res} />)
  }
  catch (e: any) {
    append(<api.Label text={e.toString()} color={0x99000099} />)
  }
}

const panel = await api.sys.makePanel({ name: "terminal" },
  <panel size={{ w: 100, h: 70 }}>
    <api.Scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      <api.GroupY align={'a'} children={$lines.adapt(ls => [...ls, textarea])} />
    </api.Scroll>
  </panel>
)

panel.focusPanel()
