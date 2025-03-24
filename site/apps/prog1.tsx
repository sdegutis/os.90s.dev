import { program } from "../client/core/prog.js"
import { showDialog } from "../client/util/dialog.js"
import { PanelView } from "../client/util/panelview.js"
import { showPrompt } from "../client/util/prompt.js"
import type { Split } from "../client/views/split.js"
import { $ } from "../shared/ref.js"

const size = $({ w: 75, h: 50 })

const t = `
fasdfasdfsadf
fasdfasdfsadf
fasdfasdfsadf
fasdfasdfsadf
fasdfasdfsadf
`

const panel = await program.makePanel({
  pos: 'center',
  view: <PanelView size={size} title={'test panel'}>
    <splitxa>
      <margin padding={0} paddingColor={0x99000099}>
        <center background={0x00330099}>
          <button onClick={async function () {
            const s = this.parent?.parent?.parent as Split
            s.dir = s.dir === 'x' ? 'y' : 'x'
            s.stick = s.stick === 'a' ? 'b' : 'a'

            await showDialog('hey1')
            await showPrompt('hey2 much longer string')

          }} padding={2}><label text={'test'} /></button>
        </center>
      </margin>
      <scroll background={0xffffff11} onMouseDown={function (...args) { this.content?.onMouseDown?.(...args) }}>
        <textarea autofocus text={t} />
      </scroll>
    </splitxa>
  </PanelView>,
})

panel.focusPanel()

setTimeout(() => {
  program.resize(320 * 2, 180 * 2)
}, 1000)
