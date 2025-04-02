import * as api from "/api.js"
await api.sys.init(self)

let content = ''
const $filepath = api.$(api.program.opts["file"])
if ($filepath.val) content = api.fs.get($filepath.val) ?? ''

const textarea = <api.Textarea text={content} autofocus /> as api.Textarea

const panel = await api.Panel.create({ name: "writer" },
  <api.FilePanelView filedata={() => textarea.text} filepath={$filepath} title={api.$('writer')} size={api.$({ w: 100, h: 70 })}>
    <api.Scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      <api.Border canMouse padding={2} onMouseDown={function (b) { this.firstChild!.onMouseDown?.(b) }}>
        {textarea}
      </api.Border>
    </api.Scroll>
  </api.FilePanelView>
)

panel.focusPanel()
