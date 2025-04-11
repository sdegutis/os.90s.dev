import * as api from "/api.js"

let content = ''
const $filepath = api.$<string | undefined>(api.program.opts["file"])
if ($filepath.val) content = await api.fs.getFile($filepath.val) ?? ''

const model = new api.TextModel(content)

if ($filepath.val?.endsWith('.jsln')) {

  highlightStartingAt(0)
  model.onLineChanged.watch(line => {
    highlightStartingAt(line)
  })

  function highlightStartingAt(row: number) {
    console.log(row, model.labels)
  }

  model.colors['symbol'] = 0x99000099

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
