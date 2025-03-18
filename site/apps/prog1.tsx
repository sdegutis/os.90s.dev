import { Program } from "../client/core/prog.js"

const prog = new Program()
await prog.init()

const panel = await prog.makePanel({
  size: [100, 100],
  view: (
    <view background={0x77000033}>
      <view
        background={0x00770033} x={10} y={20} w={30} h={40}
      >
        <Foo x={10} />
      </view>
    </view>
  ),
})

function Foo(data: { x: number }) {
  return <border
    borderColor={0x334455ff}
    padding={3}
    background={0x00770033} x={data.x} y={20} w={30} h={40}
  />
}
