import { program } from "../client/core/prog.js"
import { dragMove, dragResize } from "../client/util/drag.js"

const center = <label text={'hey world'}
  background={0x77000077}
  passthrough={false}
  onMouseDown={function (b) {
    const anchor = panel.absmouse
    this.onMouseMove = b === 0 ? dragMove(anchor, panel) : dragResize(anchor, panel)
    this.onMouseUp = () => {
      delete this.onMouseMove
      delete this.onMouseUp
    }
  }} />

const size = center.$.size.adapt(s => ({ w: s.w + 4, h: s.h + 4 }))

const panel = await program.makePanel({
  size,
  view: (
    <border paddingColor={0x00990099} padding={2}>
      {center}
    </border>
  ),
})
