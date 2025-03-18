import { Program } from "../client/core/prog.js"
import type { MousePos } from "../client/views/interface.js"
import { drawBackground } from "../client/views/view.js"
import { Bitmap } from "../shared/bitmap.js"



const fontdata = `
ffffffff

0 0 0 0 1 0 1 0 1 1 1 1 0 1 0 0 1 0 1 1 1 1 1 0 0 0 1 0 1 0 1 0 1 0 1 0 0 0 0 0 0 0 0 0 0 0 0 1
0 0 0 0 1 0 1 0 1 1 1 1 1 0 0 0 0 0 1 0 1 0 1 0 0 1 0 0 0 1 0 1 0 1 1 1 0 0 0 1 1 1 0 0 0 0 1 0
0 0 0 0 0 0 0 0 0 1 1 1 0 1 0 1 1 1 1 1 0 0 0 0 0 1 0 0 0 1 1 0 1 0 1 0 0 1 0 0 0 0 0 0 0 0 1 0
0 0 0 0 1 0 0 0 0 0 0 0 1 0 0 0 1 0 1 1 1 0 0 0 0 0 1 0 1 0 0 0 0 0 0 0 1 0 0 0 0 0 0 1 0 1 0 0
0 1 0 1 1 0 1 1 0 1 1 1 1 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 1 0 0 1 0 1 1 0 1 0 0 1 1 1
1 0 1 0 1 0 0 0 1 0 1 1 1 0 1 1 1 0 1 0 0 0 0 1 1 1 1 1 0 1 0 0 0 0 0 0 1 0 0 0 0 0 0 1 0 1 0 1
1 0 1 0 1 0 0 1 0 0 0 1 1 1 1 0 0 1 1 1 1 0 0 1 1 0 1 0 1 1 1 0 0 0 1 0 0 1 0 1 1 0 1 0 0 0 0 0
0 1 0 1 1 1 1 1 1 1 1 1 0 0 1 1 1 0 1 1 1 0 0 1 1 1 1 1 1 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 1
0 1 1 0 1 0 1 1 0 1 1 1 1 1 0 1 1 1 1 1 1 1 1 1 1 0 1 1 1 1 1 1 1 1 0 1 1 0 0 1 1 1 1 1 1 1 1 1
1 0 1 1 0 1 1 1 1 1 0 0 1 0 1 1 1 0 1 1 0 1 0 0 1 1 1 0 1 0 0 1 0 1 1 0 1 0 0 1 1 1 1 0 1 1 0 1
1 0 0 1 1 1 1 0 1 1 0 0 1 0 1 1 0 0 1 0 0 1 0 1 1 0 1 0 1 0 0 1 0 1 1 0 1 0 0 1 0 1 1 0 1 1 0 1
0 1 1 1 0 1 1 1 1 1 1 1 1 1 0 1 1 1 1 0 0 1 1 1 1 0 1 1 1 1 1 1 0 1 0 1 1 1 1 1 0 1 1 0 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 1 1 0 1 1 0 1 1 0 1 1 0 1 1 1 1 0 1 1 1 0 0 1 1 0 0 1 0 0 0 0
1 0 1 1 0 1 1 0 1 1 0 0 0 1 0 1 0 1 1 0 1 1 0 1 0 1 0 1 0 1 0 1 1 0 1 0 0 1 0 0 1 0 1 0 1 0 0 0
1 1 0 1 1 1 1 1 0 0 1 1 0 1 0 1 0 1 1 0 1 1 1 1 0 1 0 0 1 0 1 0 0 0 1 0 0 1 0 0 1 0 0 0 0 0 0 0
1 0 0 0 0 1 1 0 1 1 1 1 0 1 0 1 1 1 0 1 0 1 1 1 1 0 1 0 1 0 1 1 1 0 1 1 0 0 1 1 1 0 0 0 0 1 1 1
1 0 0 0 1 0 1 1 0 1 1 1 1 1 0 1 1 1 1 1 1 1 1 1 1 0 1 1 1 1 1 1 1 1 0 1 1 0 0 1 1 1 1 1 1 1 1 1
0 1 0 1 0 1 1 1 1 1 0 0 1 0 1 1 1 0 1 1 0 1 0 0 1 1 1 0 1 0 0 1 0 1 1 0 1 0 0 1 1 1 1 0 1 1 0 1
0 0 0 1 1 1 1 0 1 1 0 0 1 0 1 1 0 0 1 0 0 1 0 1 1 0 1 0 1 0 0 1 0 1 1 0 1 0 0 1 0 1 1 0 1 1 0 1
0 0 0 1 0 1 1 1 1 1 1 1 1 1 0 1 1 1 1 0 0 1 1 1 1 0 1 1 1 1 1 1 0 1 0 1 1 1 1 1 0 1 1 0 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 1 1 0 1 1 0 1 1 0 1 1 0 1 1 1 1 0 1 1 0 1 0 1 1 0 1 1 0 0 0 0
1 0 1 1 0 1 1 0 1 1 0 0 0 1 0 1 0 1 1 0 1 1 0 1 0 1 0 1 0 1 0 1 1 1 1 0 0 1 0 0 1 1 0 1 1 0 0 0
1 1 0 1 1 1 1 1 0 0 1 1 0 1 0 1 0 1 1 0 1 1 1 1 0 1 0 0 1 0 1 0 0 0 1 0 0 1 0 0 1 0 0 0 0 0 0 0
1 0 0 0 0 1 1 0 1 1 1 1 0 1 0 1 1 1 0 1 0 1 1 1 1 0 1 0 1 0 1 1 1 0 1 1 0 1 0 1 1 0 0 0 0 0 0 0
`.trimStart()


const CHARSET = Array(95).keys().map(i => String.fromCharCode(i + 32)).toArray()


class Font {

  spr: Bitmap
  cw: number
  ch: number
  xgap = 1
  ygap = 2

  private lastcol?: string

  constructor(data: string) {
    this.spr = Bitmap.fromString(data)
    this.cw = this.spr.width / 16
    this.ch = this.spr.height / 6
  }

  print(ctx: OffscreenCanvasRenderingContext2D, x: number, y: number, c: string, text: string) {
    let posx = 0
    let posy = 0

    if (c && this.lastcol !== c) {
      this.lastcol = c
      this.spr.colorize(c)
    }

    for (let i = 0; i < text.length; i++) {
      const ch = text[i]

      if (ch === '\n') {
        posy++
        posx = 0
        continue
      }

      const ci = ch.charCodeAt(0) - 32
      const sx = ci % 16 * this.cw
      const sy = Math.floor(ci / 16) * this.ch

      const px = x + (posx * (this.cw + this.xgap))
      const py = y + (posy * (this.ch + this.ygap))

      ctx.drawImage(this.spr.canvas, sx, sy, this.cw, this.ch, px, py, this.cw, this.ch)

      posx++
    }
  }

}

const font = new Font(fontdata)




const prog = new Program()
await prog.init()

const panel = await prog.makePanel({
  size: [100, 100],
  view: (
    <view background={0x77000033}
    >
      <view
        onWheel={(x, y) => console.log(y)}
        background={0x00770033} x={10} y={20} w={30} h={40}
        canFocus={true}
        draw={function (ctx, x, y) {
          drawBackground.call(this, ctx, x, y)
          font.print(ctx, x + 0, y + 0, '', "hello world")
        }}
        onKeyDown={key => console.log(key.toUpperCase())}
      >
        <Foo x={-10} />
      </view>
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



