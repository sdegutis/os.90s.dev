import * as api from "/api.js"

let content = ''
const $filepath = api.$(api.program.opts["file"])
if ($filepath.val) content = await api.fs.getFile($filepath.val) ?? ''

const textarea = <api.TextBox text={content} autofocus /> as api.TextBox

const panel = await api.Panel.create({ name: "writer" },
  <api.FilePanelView filedata={() => textarea.text} filepath={$filepath} title={api.$('writer')} size={api.$({ w: 100, h: 70 })}>
    <api.Scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      {textarea}
    </api.Scroll>
  </api.FilePanelView>
)

panel.focusPanel()
