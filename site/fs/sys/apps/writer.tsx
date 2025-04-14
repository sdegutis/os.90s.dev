import * as api from "/api.js"
await api.appReady

api.preferences['panel-body-gap'] = 3
api.preferences['panel-body-gap-color-focused'] = 0x990000ff

let content = ''
const $filepath = api.$<string | undefined>(api.program.opts["file"])
if ($filepath.val) content = await api.fs.getFile($filepath.val) ?? ''

const model = new api.TextModel(content)

if ($filepath.val?.endsWith('.jsln')) {
  const hl = new api.Highlighter(api.langThemes.theme1, api.langGrammars.jslnGrammar)
  model.highlighter = hl
  hl.highlight(model, 0)
}

if ($filepath.val?.endsWith('.txt')) {
  const hl = new api.Highlighter(api.langThemes.txtTheme1, api.langGrammars.txtGrammar)
  model.highlighter = hl
  hl.highlight(model, 0)
}

const panel = await api.sys.makePanel({ name: "writer" },
  <filepanel filedata={() => model.getText()} filepath={$filepath} title='writer' size={{ w: 100, h: 70 }}>
    <api.Scroll
      background={0xffffff11}
      onMouseDown={function (b) { this.content.onMouseDown?.(b) }}
      onMouseMove={function (p) { this.content.onMouseMove?.(p) }}
      onMouseUp={function () { this.content.onMouseUp?.() }}
    >
      <api.TextBox model={model} autofocus />
    </api.Scroll>
  </filepanel>
)

panel.focusPanel()
