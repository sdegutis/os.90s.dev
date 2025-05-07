import api from "/api.js"
await api.preludesFinished


api.preferences['panel-body-gap'] = 2
// api.preferences['panel-body-gap-color'] = 0x333333ff
// api.preferences['panel-body-gap-color-focused'] = 0x990000ff

let content = ''
const $filepath = api.$<string | undefined>(api.program.opts["file"])
if ($filepath.$) content = await api.fs.getFile($filepath.$) ?? ''

const model = new api.TextModel(content)

if ($filepath.$?.endsWith('.jsln')) {
  const hl = new api.Highlighter(api.langThemes.theme1, api.langGrammars.jslnGrammar)
  model.highlighter = hl
  hl.highlight(model, 0)
}

if ($filepath.$?.endsWith('.txt')) {
  const hl = new api.Highlighter(api.langThemes.txtTheme1, api.langGrammars.txtGrammar)
  model.highlighter = hl
  hl.highlight(model, 0)
}

const file = {
  getContents: () => model.getText(),
  $path: $filepath,
}

const panel = await api.sys.makePanel({ name: "editor" },
  <panel file={file} size={{ w: 200, h: 120 }}>
    <api.Scroll
      background={0xffffff11}
      onMouseDown={function (b) { this.content.onMouseDown?.(b) }}
      onMouseMove={function (p) { this.content.onMouseMove?.(p) }}
      onMouseUp={function () { this.content.onMouseUp?.() }}
    >
      <api.TextBox model={model} autofocus />
    </api.Scroll>
  </panel>
)

panel.focusPanel()
