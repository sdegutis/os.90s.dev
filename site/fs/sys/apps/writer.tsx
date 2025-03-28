let content = ''
const $filepath = $(program.opts["file"])
if ($filepath.val) content = await sys.getfile($filepath.val) ?? ''

const textarea = <Textarea text={content} autofocus /> as Textarea

const panel = await Panel.create(
  <FilePanelView name="writer" filedata={() => textarea.text} filepath={$filepath} title={$('writer')} size={$({ w: 100, h: 70 })}>
    <Scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      <Border canMouse padding={2} onMouseDown={function (b) { this.firstChild!.onMouseDown?.(b) }}>
        {textarea}
      </Border>
    </Scroll>
  </FilePanelView>
)

panel.focusPanel()
