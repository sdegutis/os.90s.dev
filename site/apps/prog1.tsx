import { Program } from "../client/core/prog.js"
import type { MousePos } from "../client/views/interface.js"


const prog = new Program()
await prog.init()

const panel = await prog.makePanel({
  size: [100, 100],
  view: (
    <view background={0x77000033}
    >
      <label
        onWheel={(x, y) => console.log(y)}
        background={0x00770033} x={10} y={20} w={30} h={40}
        canFocus={true}
        text={'hello world'}
        onKeyDown={key => console.log(key.toUpperCase())}
      >
        <Foo x={-10} />
      </label>
    </view>
  ),
})

let down: (() => void) | undefined

function Foo(data: { x: number }) {
  return <border

    onMouseDown={(b) => {
      if (b > 0) { panel.close(); return }
      down = dragMove(panel.absmouse, panel)
    }}

    onMouseMove={() => {
      down?.()
    }}

    onMouseUp={() => {
      down = undefined
    }}

    borderColor={0x334455ff}
    padding={3}
    background={0x00770033} x={data.x} y={20} w={30} h={40}
  />
}

interface Movable {
  readonly x: number
  readonly y: number
  move(x: number, y: number): void
}

function dragMove(m: MousePos, o: Movable) {
  const startPos = { x: o.x, y: o.y }
  const offx = m.x - startPos.x
  const offy = m.y - startPos.y
  return () => {
    const diffx = m.x - startPos.x
    const diffy = m.y - startPos.y
    const x = startPos.x + diffx - offx
    const y = startPos.y + diffy - offy
    o.move(x, y)
    // return { x: diffx - offx, y: diffy - offy }
  }
}
