import { Program } from "../client/core/prog.js"
import { dragMove } from "../client/util/drag.js"
import { $, Ref } from "../client/util/ref.js"
import type { border } from "../client/views/border.js"
import { ClickCounter } from "../client/views/button.js"
import { image } from "../client/views/image.js"
import type { spacedx } from "../client/views/spaced.js"
import type { Pos, view } from "../client/views/view.js"
import { Bitmap } from "../shared/bitmap.js"

const minImage = new Bitmap([0x333333ff], 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,])
const maxImage = new Bitmap([0x333333ff], 4, [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1,])
const axeImage = new Bitmap([0x333333ff], 4, [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,])
const adjImage = new Bitmap([0xffffff77], 3, [0, 0, 1, 0, 0, 1, 1, 1, 1,])
const menubuttonImage = new Bitmap([0x333333ff], 4, [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1])

const prog = new Program()
await prog.init()

const panel = await prog.makePanel({
  size: [100, 100],
  view: <PanelView title={'test panel'}>
    <label text={'cool'} />
  </PanelView>,
})

function PanelView(data: { title: string | Ref<string>, children: view }) {

  const pad = 2

  const focused = $(false)
  const borderColor = focused.adapt<number>(b => b ? 0x005599ff : 0x00559944)

  const counter = new ClickCounter()
  function titleBarMouseDown(this: spacedx, button: number, pos: Pos) {
    counter.increase()

    this.onMouseMove = dragMove(pos, panel)
    this.onMouseUp = () => {
      delete this.onMouseMove
      delete this.onMouseUp
    }

    // const drag = dragMove(this)
    // sys.trackMouse({
    //   move: () => {
    //     const moved = drag()
    //     if (Math.hypot(moved.x, moved.y) > 1) {
    //       counter.count = 0
    //       this.lastPos = undefined
    //     }
    //   },
    //   up: () => {
    //     if (counter.count >= 2) {
    //       this.maximize()
    //     }
    //   },
    // })
  }

  function resizerMouseDown(this: image) {
    // this.lastPos = undefined
    // const resize = dragResize(this)
    // sys.trackMouse({
    //   move: () => {
    //     resize()
    //     if (this.w < this.minw) this.w = this.minw
    //     if (this.h < this.minh) this.h = this.minh
    //   }
    // })
  }

  function minw() { }
  function maxw() { }
  function axew() { }

  function layoutContentView(this: border) {
    this.firstChild?.mutate(c => {
      c.x = pad
      c.y = 0
      c.w = this.w - (pad * 2)
      c.h = this.h - pad
    })
  }
  return (
    <border padding={1} layout={vacuumFirstLayout} borderColor={borderColor}>

      <panedya gap={-1}>

        <spacedx onMouseDown={titleBarMouseDown}>
          <border padding={1}>
            <groupx gap={1}>
              <button background={0x111111ff} padding={2}><image bitmap={menubuttonImage} /></button>
              <label text={data.title} />
            </groupx>
          </border>
          <border padding={1}>
            <groupx>
              <button background={0x111111ff} padding={2} onClick={minw}><image bitmap={minImage} /></button>
              <button background={0x111111ff} padding={2} onClick={maxw}><image bitmap={maxImage} /></button>
              <button background={0x111111ff} padding={2} onClick={axew} hoverBackground={0x99000055} pressBackground={0x44000099}><image bitmap={axeImage} /></button>
            </groupx>
          </border>
        </spacedx>

        <border layout={layoutContentView}>
          {data.children}
        </border>

      </panedya>

      <image
        passthrough={false}
        bitmap={adjImage}
        layout={function () {
          const mthis = this.mutable()
          mthis.x = this.parent!.w - this.w
          mthis.y = this.parent!.h - this.h
          mthis.commit()
        }}
        onMouseDown={resizerMouseDown}
      />

    </border>
  )
}

function vacuumFirstLayout(this: view) {
  this.firstChild?.mutate(c => {
    console.log('here')
    c.x = 0
    c.y = 0
    c.w = this.w
    c.h = this.h
  })
}

// function Titlebar() {
//   let down: (() => void) | undefined

//   return <spacedx background={0x330000ff}
//     onMouseDown={(b, pos) => { down = dragMove(pos, panel) }}
//     onMouseMove={() => { down?.() }}
//     onMouseUp={() => { down = undefined }}
//   >
//     <border padding={1} borderColor={0x007700ff}>
//       <border padding={1} borderColor={0x770000ff}>
//         <label text={t} background={0x00000033} />
//       </border>
//     </border>
//     <image bitmap={axeImage} />
//   </spacedx>
// }

// // function MyView(data: { w: number, h: number }) {
// //   const ref = $('hey')
// //   const r = $('#f0f')
// //   return <label background={'#77000033'} w={data.w} h={data.h}
// //     text={'hi world'}
// //     textColor={'#ff0'}
// //   >
// //     <image
// //       onWheel={(x, y) => console.log(y)}
// //       background={'#00770033'} x={10} y={20} w={30} h={40}
// //       canFocus={true}
// //       onMouseDown={(b) => { if (b > 0) panel.close() }}
// //       image={axeImage}
// //       // text={'hello world'}
// //       onKeyDown={key => console.log(key.toUpperCase())}
// //     >
// //       <Foo x={-10} />
// //       <label x={1} y={1} w={100} h={10} background={'#000'} text={ref} textColor={r}
// //         onMouseDown={() => {
// //           // ref.val += ' hi;'
// //           r.val = '#' + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0')
// //         }}
// //       />
// //     </image>
// //   </label>
// // }


// // function Foo(data: { x: number }) {
// //   let down: (() => void) | undefined

// //   return <border
// //     onMouseDown={(b) => { down = dragMove(panel.absmouse, panel) }}
// //     onMouseMove={() => { down?.() }}
// //     onMouseUp={() => { down = undefined }}

// //     borderColor={'#334455ff'}
// //     padding={3}
// //     background={'#00770033'} x={data.x} y={20} w={30} h={40}
// //   />
// // }
