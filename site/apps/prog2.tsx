import { program } from "../client/core/prog.js"
import { dragMove, dragResize } from "../client/util/drag.js"
import { $ } from "../client/util/ref.js"

const size = $({ w: 40, h: 40 })
const panel = await program.makePanel({
  size,
  view: (
    <border borderColor={0x00990099} padding={2}>
      <view size={size.adapt(s => ({ w: s.w - 4, h: s.h - 4 }))} background={0x77000077}
        onMouseDown={function (b, pos) {
          this.onMouseMove = b === 0 ? dragMove(pos, panel) : dragResize(pos, panel)
          this.onMouseUp = () => {
            delete this.onMouseMove
            delete this.onMouseUp
          }
        }}
      />
    </border>
  ),
})
