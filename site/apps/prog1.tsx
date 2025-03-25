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
const zoom = $(2)

zoom.intercept(n => Math.max(1, n))

const CHARSET = Array(96).keys().map(i => String.fromCharCode(i + 32)).toArray()

const panel = await Panel.create(
  <PanelView title={'Font Maker'}>
    <splitxa min={zoom.adapt(z => z * 5)}>
      <button><label text={'asfdasd'} /></button>
      <panedyb>
        <scroll draw={makeStripeDrawer()} background={0xffffff11}>
          <border padding={zoom}>
            <grid xgap={zoom} ygap={zoom} cols={16} children={CHARSET.map(ch =>
              <CharView char={ch} zoom={zoom} width={width} height={height} />
            )} />
          </border>
        </scroll>
        <border padding={2} passthrough={false} onWheel={(x, y) => zoom.val += -y / 100}>
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
            </groupx>
          </groupy>
        </border>
      </panedyb>
    </splitxa>
  </PanelView>
)

function CharView({ char, width, height, zoom }: { char: string, zoom: Ref<number>, width: Ref<number>, height: Ref<number> }) {
  return <border background={0xffffff11} padding={1}>

    <view

      passthrough={false}

      init={function () {
        this.$.hovered.watch(() => this.needsRedraw())
      }}

      onMouseEnter={function () { this.panel?.pushCursor(Cursor.NONE) }}
      onMouseExit={function () { this.panel?.popCursor(Cursor.NONE) }}
      onMouseMove={function () { this.needsRedraw() }}

      draw={function (ctx, px, py) {
        if (this.hovered) {
          ctx.fillStyle = '#f00'
          ctx.fillRect(px + this.mouse.x, py + this.mouse.y, 1, 1)
        }
      }}

      size={multiplex([width, height, zoom], () => ({
        w: width.val * zoom.val,
        h: height.val * zoom.val,
      }))}

    />

    {/* <label background={0x000000ff} text={data.char} /> */}
  </border>
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
