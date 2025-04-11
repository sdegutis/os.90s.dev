import * as api from "/api.js"

let content = ''
const $filepath = api.$(api.program.opts["file"])
if ($filepath.val) content = await api.fs.getFile($filepath.val) ?? ''

const model = new api.TextModel(content)

const panel = await api.Panel.create({ name: "writer" },
  <api.FilePanelView filedata={() => model.getText()} filepath={$filepath} title='writer' size={{ w: 100, h: 70 }}>
    <api.Scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      <api.TextBox model={model} autofocus />
    </api.Scroll>
  </api.FilePanelView>
)

panel.focusPanel()
