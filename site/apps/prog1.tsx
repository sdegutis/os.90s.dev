import { Program } from "../client/core/prog.js"

const prog = new Program()
await prog.init()

const panel = await prog.makePanel({
  size: [100, 100],
  view: (
    <view background={0x77000033}>
      <view background={0x00770033} x={10} y={10} w={10} h={10} />
    </view>
  ),
})

const foo = <>
  <border padding={3} />
  <Foo hi={3} children={[]} />
</>

function Foo(data: { hi: 3, children: string[] }) {
  return <view />
}

console.log('tes', foo)
