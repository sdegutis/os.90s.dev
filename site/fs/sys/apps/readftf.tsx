import * as api from "/api.js"

let content = ''
const $filepath = api.$<string | undefined>(api.program.opts["file"])
if ($filepath.val) content = await api.fs.getFile($filepath.val) ?? ''

const model = new api.TextModel(content)

const hl = new api.Highlighter(api.langThemes.ftfTheme1, api.langGrammars.ftfGrammar)
model.highlighter = hl
// hl.log = true
hl.highlight(model, 0)

const panel = await api.Panel.create({ name: "readftf" },
  <api.FilePanelView filedata={() => model.getText()} filepath={$filepath} title='readftf' size={{ w: 100, h: 70 }}>
    <api.Scroll
      background={0xffffff11}
      onMouseDown={function (b) { this.content.onMouseDown?.(b) }}
      onMouseMove={function (p) { this.content.onMouseMove?.(p) }}
      onMouseUp={function () { this.content.onMouseUp?.() }}
    >
      <api.Border padding={4}
        onMouseDown={function (b) { this.firstChild!.onMouseDown?.(b) }}
        onMouseMove={function (p) { this.firstChild!.onMouseMove?.(p) }}
        onMouseUp={function () { this.firstChild!.onMouseUp?.() }}
      >
        <api.TextBox editable={false} model={model} autofocus />
      </api.Border>
    </api.Scroll>
  </api.FilePanelView>
)

panel.focusPanel()
