import { program } from "../client/core/prog.js"
import { showDialog } from "../client/util/dialog.js"
import { showMenu } from "../client/util/menu.js"
import { PanelView } from "../client/util/panelview.js"
import { $ } from "../client/util/ref.js"

const size = $({ w: 100, h: 50 })

const panel = await program.makePanel({
  size,
  pos: 'center',
  view: <PanelView size={size} title={'test panel'}>
    <panedyb gap={2}>
      <scroll background={0xffffff11} onMouseDown={function (...args) { this.content?.onMouseDown?.(...args) }}>
        <textarea adoptedByPanel={function () {
          this.focus()
        }} />
      </scroll>
      <groupx>
        <button
          onClick={async function () {
            await showDialog('is this so cool or what')

            showMenu(this.panel!.absmouse, [
              { text: 'test 1', onClick() { console.log('test 1!') } },
              { text: 'test two', onClick() { console.log('test 2!') } },
              { text: 'test 3', onClick() { console.log('test 3!') } },
              '-',
              { text: 'test 4', onClick() { console.log('test 4!?') } },
            ])
          }}
          padding={2}><label text={'test'} /></button>
      </groupx>
    </panedyb>
  </PanelView>,
})

panel.focus()
