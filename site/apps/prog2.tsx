import { Program } from "../client/core/prog.js"
import { dragMove } from "../client/util/drag.js"

const prog = new Program()
await prog.init()

const panel = await prog.makePanel({
  size: [320 / 2, 180 / 2],
  view: (
    <view background={0x00770033}
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
