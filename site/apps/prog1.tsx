import { Program } from "../client/core/prog.js"
import { dragMove } from "../client/util/drag.js"

const prog = new Program()
await prog.init()

const dialog = <border
  passthrough={false}
  onMouseDown={function (b, pos) {
    this.onMouseMove = dragMove(pos, dialog)
    this.onMouseUp = () => delete this.onMouseMove
  }}
  background={0x000000cc} padding={1} borderColor={0x005599ff}>
  <border padding={3} passthrough={true}>
    <groupy align={'z'} gap={4}>
      <border padding={2}>
        <label text={'are you sure?'} />
      </border>
      <groupx gap={2}>
        <button onClick={no} background={0x99000099} padding={2}><label text={'cancel'} /></button>
        <button onClick={ok} background={0xffffff33} padding={2}><label text={'ok'} /></button>
      </groupx>
    </groupy>
  </border>
</border>

const panel = await prog.makePanel({
  size: dialog.$ref('size'),
  pos: 'center',
  view: dialog,
})

panel.focus()

function ok() { console.log('ok') }
function no() { console.log('no') }
