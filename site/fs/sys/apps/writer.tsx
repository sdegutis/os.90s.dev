let content = ''
const $filepath = $(program.opts["file"])
if ($filepath.val) content = await sys.getfile($filepath.val) ?? ''

const textarea = <textarea text={content} autofocus /> as Textarea

const panel = await Panel.create(
  <FilePanelView filedata={() => textarea.text} filepath={$filepath} title={$('writer')} size={$({ w: 100, h: 70 })}>
    <scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      <border canMouse padding={2} onMouseDown={function (b) { this.firstChild!.onMouseDown?.(b) }}>
        {textarea}
      </border>
    </scroll>
  </FilePanelView>
)

panel.focusPanel()
