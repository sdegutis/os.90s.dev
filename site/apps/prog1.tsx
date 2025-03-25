import { Panel } from "../client/core/panel.js"
import { PanelView } from "../client/util/panelview.js"
import { View } from "../client/views/view.js"
import { Cursor } from "../shared/cursor.js"
import { $, multiplex, Ref } from "../shared/ref.js"

const SAMPLE_TEXT = [
  "how quickly daft jumping zebras vex!",
  "the five boxing wizards jump quickly.",
  "the quick brown fox, jumps over the lazy dog.",
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789 (){}[]<>",
  `.,'!?-+/":;%*=_&#|\`$@~^\\`,
].join('\n')

const width = $(3)
const height = $(4)
const zoom = $(8)
const current = $(' ')

zoom.intercept(n => Math.max(1, n))

const CHARSET = Array(96).keys().map(i => String.fromCharCode(i + 32)).toArray()

const panel = await Panel.create(
  <PanelView title={'Font Maker'} size={$({ w: 500, h: 300 })}>
    <panedyb>
      <scroll draw={makeStripeDrawer()} background={0xffffff11}>
        <border padding={zoom}>
          <grid xgap={zoom} ygap={zoom} cols={16} children={CHARSET.map(ch =>
            <CharView char={ch} zoom={zoom} width={width} height={height} hover={ch => current.val = ch} />
          )} />
        </border>
      </scroll>
      <border padding={2} canMouse onWheel={(x, y) => zoom.val += -y / 100}>
        <groupy align='a' gap={4}>
          <label text={SAMPLE_TEXT} />
          <groupx gap={7}>
            <groupx gap={2}>
              <label textColor={0xffffff33} text='width' />
              <label textColor={0xffff00cc} text={width.adapt(n => n.toString())} />
            </groupx>
            <groupx gap={2}>
              <label textColor={0xffffff33} text='height' />
              <label textColor={0xffff00cc} text={height.adapt(n => n.toString())} />
            </groupx>
            <groupx gap={2}>
              <label textColor={0xffffff33} text='zoom' />
              <label textColor={0xffff00cc} text={zoom.adapt(n => n.toString())} />
            </groupx>
            <groupx gap={2}>
              <label textColor={0xffffff33} text='hover' />
              <label textColor={0xffff00cc} text={current} />
            </groupx>
          </groupx>
        </groupy>
      </border>
    </panedyb>
  </PanelView>
)

function CharView(
  { char, width, height, zoom, hover }: {
    hover: (ch: string) => void,
    char: string,
    zoom: Ref<number>,
    width: Ref<number>,
    height: Ref<number>,
  }
) {
  const spots: Record<string, boolean> = Object.create(null)

  const view = <view

    canMouse
    background={0x00000033}

    onMouseEnter={function () { this.panel?.pushCursor(Cursor.NONE); hover(char) }}
    onMouseExit={function () { this.panel?.popCursor(Cursor.NONE) }}
    onMouseMove={function () { this.needsRedraw() }}

    draw={function (ctx, px, py) {
      View.prototype.draw.call(this, ctx, px, py)

      ctx.fillStyle = '#fff'
      for (let x = 0; x < width.val; x++) {
        for (let y = 0; y < height.val; y++) {
          const key = `${x},${y}`
          const on = spots[key]
          if (on) {
            ctx.fillRect(
              px + x * zoom.val,
              py + y * zoom.val,
              zoom.val,
              zoom.val
            )
          }
        }
      }

      if (this.hovered) {
        const xy = {
          x: Math.floor(this.mouse.x / zoom.val) * zoom.val,
          y: Math.floor(this.mouse.y / zoom.val) * zoom.val,
        }
        ctx.fillStyle = '#00f9'
        ctx.fillRect(px + xy.x, py + xy.y, zoom.val, zoom.val)
      }
    }}

    size={multiplex([width, height, zoom], () => ({
      w: width.val * zoom.val,
      h: height.val * zoom.val,
    }))}

  />

  view.$.hovered.watch(() => view.needsRedraw())

  const $spot = multiplex([view.$.mouse, zoom], () => {
    const x = Math.floor(view.mouse.x / zoom.val)
    const y = Math.floor(view.mouse.y / zoom.val)
    return { x, y }
  })

  const $key = $spot.adapt(s => `${s.x},${s.y}`)

  // $spot.watch((s) => {
  //   console.log('spot', s)
  // })

  // $key.watch((s) => {
  //   console.log('key', s)
  // })


  view.onMouseDown = function (b) {
    const add = () => {
      const x = Math.floor(this.mouse.x / zoom.val)
      const y = Math.floor(this.mouse.y / zoom.val)
      const key = `${x},${y}`
      spots[key] = b === 0
      return { x, y }
    }
    const start = add()

    // const 
    // dragMove(this.$.mouse, {
    //   get point() { return start },
    //   set point()
    // })
  }

  return (
    <border paddingColor={0xffffff11} padding={1}>
      {view}
    </border>
  )
}

panel.focusPanel()

function makeStripeDrawer(w = 4, h = 3) {
  return function (this: View, ...[ctx, px, py]: Parameters<View['draw']>) {
    this.drawBackground(ctx, px, py, this.background)

    ctx.fillStyle = '#ffffff04'

    let off = 0
    for (let y = 0; y < this.size.h; y++) {
      for (let x = 0; x < this.size.w; x += w) {
        ctx.fillRect(px + x + off, py + y, 1, 1)
      }
      if (y % h === (h - 1)) off = (off + 1) % w
    }
  }
}
