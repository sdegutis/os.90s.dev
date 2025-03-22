import { program } from "../client/core/prog.js"
import { dragMove, dragResize } from "../client/util/drag.js"

const center = <label text={'hey world'}
  background={0x77000077}
  passthrough={false}
  onMouseDown={function (b, pos) {
    this.onMouseMove = b === 0 ? dragMove(pos, panel) : dragResize(pos, panel)
    this.onMouseUp = () => {
      delete this.onMouseMove
      delete this.onMouseUp
    }
  }} />

const size = center.$ref('size').adapt(s => ({ w: s.w + 4, h: s.h + 4 }))

const panel = await program.makePanel({
  size,
  view: (
    <border borderColor={0x00990099} padding={2}>
      {center}
    </border>
  ),
})
