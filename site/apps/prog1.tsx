import { Panel } from "../client/core/panel.js"
import { dragMove } from "../client/util/drag.js"
import { PanelView } from "../client/util/panelview.js"
import { pointEquals } from "../client/util/types.js"
import { View } from "../client/views/view.js"
import { Bitmap } from "../shared/bitmap.js"
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
              <Slider val={width} min={1} max={10} />
            </groupx>
            <groupx gap={2}>
              <label textColor={0xffffff33} text='height' />
              <label textColor={0xffff00cc} text={height.adapt(n => n.toString())} />
              <Slider val={height} min={1} max={10} />
            </groupx>
            <groupx gap={2}>
              <label textColor={0xffffff33} text='zoom' />
              <label textColor={0xffff00cc} text={zoom.adapt(n => n.toString())} />
              <Slider val={zoom} min={1} max={10} />
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

function Slider({ val, min, max }: { val: Ref<number>, min: number, max: number }) {
  const w = 30
  const kw = 4

  const knobImage = new Bitmap([0xffffff99], kw, [
    0, 1, 1, 0,
    1, 1, 1, 1,
    1, 1, 1, 1,
    0, 1, 1, 0,
  ])

  const $per = $((val.val - min) / (max - min))
  $per.intercept(per => Math.max(0, Math.min(per, 1)))
  $per.watch(per => val.val = Math.round(per * (max - min) + min))

  const knob = <image bitmap={knobImage} point={$per.adapt(per => ({ x: Math.round(per * (w - kw)), y: 0 }))} />

  const onMouseDown = function (this: View): void {
    const $movepoint = $(knob.point)
    $movepoint.watch(p => $per.val = p.x / (w - kw))
    this.onMouseUp = dragMove(this.$.mouse, $movepoint)
  }

  return <view canMouse size={{ w, h: 4 }} onMouseDown={onMouseDown}>
    <view point={{ x: 0, y: 1 }} size={{ w, h: 1 }} background={0xffffff77} />
    {knob}
  </view>
}

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

  const $spot = multiplex([view.$.mouse, zoom], () => {
    const x = Math.floor(view.mouse.x / zoom.val)
    const y = Math.floor(view.mouse.y / zoom.val)
    return { x, y }
  })
  $spot.equals = pointEquals

  const $key = $spot.adapt(s => `${s.x},${s.y}`)

  view.$.hovered.watch(() => view.needsRedraw())
  $spot.watch(() => view.needsRedraw())

  view.onMouseDown = function (b) {
    const on = b === 0
    spots[$key.val] = on
    this.onMouseMove = () => spots[$key.val] = on
    this.onMouseUp = () => delete this.onMouseMove
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
