import { Panel } from "/client/core/panel.js"
import { program } from "/client/core/prog.js"
import { $ } from "/client/core/ref.js"
import { PanelView } from "/client/util/panelview.js"

const TEST = `
this is a long string
it has multiple lines
hmm
it is not colorful yet...
`.trim()

const panel = await Panel.create(
  <PanelView title={'Writer'} size={$({ w: 100, h: 70 })}>
    <splitya>
      <view>
        <button padding={2}><label text={'hmm'} /></button>
      </view>
      <scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
        <border padding={2}>
          <label text={TEST} />
        </border>
      </scroll>
    </splitya>
  </PanelView>
)

panel.focusPanel()

console.log(await program.listdir('sys/'))
console.log(await program.getfile('sys/crt34.font'))
