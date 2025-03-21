import { Program } from "../client/core/prog.js"
import { dragMove } from "../client/util/drag.js"
import { $ } from "../client/util/ref.js"

const prog = new Program()
await prog.init()

const size = $({ w: 320 / 2, h: 180 / 2 })
const panel = await prog.makePanel({
  size,
  view: (
    <view size={size} background={0x77000033}
      onMouseDown={function (b, pos) {
        this.onMouseMove = dragMove(pos, panel)
        this.onMouseUp = () => {
          delete this.onMouseMove
          delete this.onMouseUp
        }
      }}
    />
  ),
})
