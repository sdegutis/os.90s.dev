const TEST = `
this is a long string
it has multiple lines
hmm
it is not colorful yet...
`.trim()

const panel = await Panel.create(
  <PanelView title={$('FONT MAKER 1 font maker 2')} size={$({ w: 100, h: 70 })}>
    <Scroll>
      <Textarea text={TEST} />
    </Scroll>
  </PanelView>
)

panel.focusPanel()
