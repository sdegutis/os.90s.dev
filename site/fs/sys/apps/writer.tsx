import * as api from "/api.js"

let content = ''
const $filepath = api.$<string | undefined>(api.program.opts["file"])
if ($filepath.val) content = await api.fs.getFile($filepath.val) ?? ''

const model = new api.TextModel(content)

if ($filepath.val?.endsWith('.jsln')) {

  const theme1: api.LangTheme = {
    key: 0xff00ff99,
    punc: 0xffffff33,

    quote: 0xffff00ff,
    string: 0xff9900ff,
    escape: 0xff99ffff,

    number: 0x0099ffff,
    literal: 0x00ff99ff,

    comment: 0x009900ff,
    error: 0x990000ff,

  }

  const jslnGrammar: api.LangGrammar = {
    'start': [
      [/[a-zA-Z0-9_]+/, 'key'],
      [/\./, 'punc'],
      [/=/, ['punc', '@push(val)']],
      [/#/, ['comment', 'comment']],
      [/[ \t]+/, ''],
    ],
    'comment': [
      [/^/, ['', 'start']],
      [/.+/, 'comment'],
    ],
    'val': [
      [/^/, ['', '@pop()']],
      [/\[/, ['quote', '@push(array)']],
      [/(\btrue\b|\bfalse\b|\bnull\b)/, ['literal', '@pop()']],
      [/0x[0-9a-fA-F]+/, ['number', 'start']],
      [/[0-9]+/, ['number', 'start']],
      [/["']/, ['quote', '@push(string)']],
      [/[ \t]+/, ''],
    ],
    'array': [
      [/^/, ['error', 'error']],
      [/,/, 'punc'],
      [/\[/, ['quote', '@push(array)']],
      [/\]/, ['quote', '@pop()']],
      [/(\btrue\b|\bfalse\b|\bnull\b)/, 'literal'],
      [/[a-zA-Z]+/, 'error'],
      [/0x[0-9a-fA-F]+/, 'number'],
      [/[0-9]+/, 'number'],
      [/[ \t]+/, ''],
    ],
    'string': [
      [/\\["rnt]/, 'escape'],
      [/\\./, 'error'],
      [/[^"]+$/, ['error', 'error']],
      [/"/, ['quote', '@pop()']],
      [/[^\\"]+/, 'string'],
    ],
  }

  model.highlighter = new api.Highlighter(theme1, jslnGrammar, true)
  model.highlighter.highlight(model, 0)

}

const panel = await api.Panel.create({ name: "writer" },
  <api.FilePanelView filedata={() => model.getText()} filepath={$filepath} title='writer' size={{ w: 100, h: 70 }}>
    <api.Scroll
      background={0xffffff11}
      onMouseDown={function (b) { this.content.onMouseDown?.(b) }}
      onMouseMove={function (p) { this.content.onMouseMove?.(p) }}
      onMouseUp={function () { this.content.onMouseUp?.() }}
    >
      <api.TextBox model={model} autofocus />
    </api.Scroll>
  </api.FilePanelView>
)

panel.focusPanel()
