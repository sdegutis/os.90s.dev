import * as api from "/api.js"

api.composites['panel-body'] = function PanelBodyComp(data: {
  children: any
  panelFocused: api.Ref<boolean>
}) {
  return <api.Margin padding={3} paddingColor={
    data.panelFocused.adapt<number>(b => b ? 0x000000ff : 0x222222ff)
  }>
    <api.Margin background={0x222222ff}>
      {data.children}
    </api.Margin>
  </api.Margin>
}

let content = ''
const $filepath = api.$<string | undefined>(api.program.opts["file"])
if ($filepath.val) content = await api.fs.getFile($filepath.val) ?? ''

const model = new api.TextModel(content)

if ($filepath.val?.endsWith('.jsln')) {
  const hl = new api.Highlighter(api.langThemes.theme1, api.langGrammars.jslnGrammar)
  model.highlighter = hl
  hl.highlight(model, 0)
}

if ($filepath.val?.endsWith('.ftf')) {
  const hl = new api.Highlighter(api.langThemes.ftfTheme1, api.langGrammars.ftfGrammar)
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
