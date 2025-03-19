import { Program } from "../client/core/prog.js"
import { $ } from "../client/util/ref.js"
import { Bitmap } from "../shared/bitmap.js"

const minImage = new Bitmap(['333333ff'], 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,])
const maxImage = new Bitmap(['333333ff'], 4, [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1,])
const axeImage = new Bitmap(['333333ff'], 4, [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,])
const adjImage = new Bitmap(['ffffff77'], 3, [0, 0, 1, 0, 0, 1, 1, 1, 1,])

const prog = new Program()
await prog.init()

const d = $('y' as 'x' | 'y')
const r = $(1)
const t = $('hey')
// setInterval(() => {
//   d.val = d.val === 'x' ? 'y' : 'x'

//   // r.val += 1
//   // t.val += ' .'
//   console.log(d.val)
// }, 1000)

const panel = await prog.makePanel({
  size: [100, 100],
  view: (
    <paned background={0x77000033} dir={d} gap={3}>
      <Titlebar />
      <view background={0x330033ff}>
        <button padding={3} background={0x000099ff} onClick={(b) => console.log('hey', panel.root)}>
          <label text={'hey'} />
        </button>
      </view>
    </paned>
  ),
})

function Titlebar() {
  let down: (() => void) | undefined

  return <groupx gap={r} background={0x330000ff}
    onMouseDown={(b) => { down = dragMove(panel.absmouse, panel) }}
    onMouseMove={() => { down?.() }}
    onMouseUp={() => { down = undefined }}
  >
    <border padding={1} borderColor={'#070'}>
      <border padding={1} borderColor={'#700'}>
        <label text={t} background={0x00000033} />
      </border>
    </border>
    <image bitmap={axeImage} />
  </groupx>
}

// function MyView(data: { w: number, h: number }) {
//   const ref = $('hey')
//   const r = $('#f0f')
//   return <label background={'#77000033'} w={data.w} h={data.h}
//     text={'hi world'}
//     textColor={'#ff0'}
//   >
//     <image
//       onWheel={(x, y) => console.log(y)}
//       background={'#00770033'} x={10} y={20} w={30} h={40}
//       canFocus={true}
//       onMouseDown={(b) => { if (b > 0) panel.close() }}
//       image={axeImage}
//       // text={'hello world'}
//       onKeyDown={key => console.log(key.toUpperCase())}
//     >
//       <Foo x={-10} />
//       <label x={1} y={1} w={100} h={10} background={'#000'} text={ref} textColor={r}
//         onMouseDown={() => {
//           // ref.val += ' hi;'
//           r.val = '#' + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0')
//         }}
//       />
//     </image>
//   </label>
// }


// function Foo(data: { x: number }) {
//   let down: (() => void) | undefined

//   return <border
//     onMouseDown={(b) => { down = dragMove(panel.absmouse, panel) }}
//     onMouseMove={() => { down?.() }}
//     onMouseUp={() => { down = undefined }}

//     borderColor={'#334455ff'}
//     padding={3}
//     background={'#00770033'} x={data.x} y={20} w={30} h={40}
//   />
// }

interface Movable {
  readonly x: number
  readonly y: number
  move(x: number, y: number): void
}

type Pos = {
  readonly x: number,
  readonly y: number,
}

function dragMove(m: Pos, o: Movable) {
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
