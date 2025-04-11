import * as api from "/api.js"

let content = ''
const $filepath = api.$<string | undefined>(api.program.opts["file"])
if ($filepath.val) content = await api.fs.getFile($filepath.val) ?? ''

const model = new api.TextModel(content)

if ($filepath.val?.endsWith('.jsln')) {

  // highlightStartingAt(0)
  // // model.onLineChanged.watch(line => {
  // //   highlightStartingAt(line)
  // // })

  // function highlightStartingAt(row: number) {
  //   console.log(row, model.labels)

  //   for (let i = row; i < model.lines.length; i++) {
  //     // model.labels[i].set
  //   }

  // }

  // model.colors['ident'] = 0x99000099
  // model.colors['punc'] = 0xffffff33
  // model.colors['string'] = 0x0099ffff

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
