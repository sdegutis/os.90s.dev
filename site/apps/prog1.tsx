import { Program } from "../client/core/prog.js"
import { drawBackground } from "../client/views/index.js"

const prog = new Program()
await prog.init()

const panel = await prog.makePanel({
  size: [100, 100],
  view: (
    <view background={0x77000033}>
      <view background={0x00770033} x={10} y={20} w={30} h={81}

        draw={function (...args) {
          drawBackground.apply(this, args)
          console.log(args)
        }}
      />
    </view>
  ),
})
