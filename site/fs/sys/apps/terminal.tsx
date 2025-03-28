const $lines = $<View[]>([])
const textarea = <Textarea autofocus multiline={false} onEnter={submit} /> as Textarea
const context = {}

function append(view: View) {
  $lines.val = [...$lines.val, view]
}

function submit() {
  let toeval = textarea.text
  textarea.text = ''

  append(<Label text={toeval} />)

  if (!toeval.match(/^(const|var|let)/)) toeval = `return ${toeval}`
  try {
    const fn = new Function(toeval)
    const res = fn.apply(context)
    append(<Label text={'> ' + res} />)
  }
  catch (e: any) {
    append(<Label text={e.toString()} textColor={0x99000099} />)
  }
}

const panel = await Panel.create(
  <PanelView name="terminal" title={$('terminal')} size={$({ w: 100, h: 70 })}>
    <Scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
      <GroupY align={'a'} children={$lines.adapt(ls => [...ls, textarea])} />
    </Scroll>
  </PanelView>
)

panel.focusPanel()
