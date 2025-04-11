import * as api from "/api.js"

let content = ''
const $filepath = api.$<string | undefined>(api.program.opts["file"])
if ($filepath.val) content = await api.fs.getFile($filepath.val) ?? ''

const model = new api.TextModel(content)

if ($filepath.val?.endsWith('.jsln')) {

  const hl = new api.Highlighter({
    ident: 0x99000099,
    punc: 0xffffff33,
    string: 0x0099ffff,
    number: 0x00ff99ff,
  }, {
    '': [
      [/[a-zA-Z0-9_]+/, { token: 'ident' }],
      [/[.=]/, { token: 'punc' }],
      [/#/, { token: 'comment', next: 'comment' }],
      [/0x[0-9]+/, { token: 'number' }],
      [/[0-9]+/, { token: 'number' }],
    ],
    'comment': [
      [/.+$/, { token: 'comment', next: '' }],
    ],
  })

  model.highlighter = hl
  model.highlightDocument()

}

const panel = await api.Panel.create({ name: "writer" },
  <api.FilePanelView filedata={() => model.getText()} filepath={$filepath} title='writer' size={{ w: 100, h: 70 }}>
    <api.Scroll
      background={0xffffff11}
      onMouseDown={function (b) { this.content.onMouseDown?.(b) }}
      onMouseMove={function (p) { this.content.onMouseMove?.(p) }}
    >
      <api.TextBox model={model} autofocus />
    </api.Scroll>
  </api.FilePanelView>
)

panel.focusPanel()
