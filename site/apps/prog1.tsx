import { Panel } from "../client/core/panel.js"
import { PanelView } from "../client/util/panelview.js"
import { View } from "../client/views/view.js"
import { $ } from "../shared/ref.js"

const SAMPLE_TEXT = [
  "how quickly daft jumping zebras vex!",
  "the five boxing wizards jump quickly.",
  "the quick brown fox, jumps over the lazy dog.",
  ` .,'!?1234567890-+/()":;%*=[]<>_&#|{}\`$@~^\\`,
].join('\n')

const width = $(3)
const height = $(4)
const zoom = $(2)

const panel = await Panel.create(
  <PanelView title={'Font Maker'}>
    <panedyb>
      <view background={0x222222ff} draw={makeStripeDrawer()}>

      </view>
      <border padding={2}>
        <groupy align='a' gap={4}>
          <label text={SAMPLE_TEXT} />
          <groupx gap={7}>
            <groupx gap={2}>
              <label text='width' textColor={0x777777ff} />
              <label text={width.adapt(n => n.toString())} />
            </groupx>
            <groupx gap={2}>
              <label text='height' textColor={0x777777ff} />
              <label text={height.adapt(n => n.toString())} />
            </groupx>
            <groupx gap={2}>
              <label text='zoom' textColor={0x777777ff} />
              <label text={zoom.adapt(n => n.toString())} />
            </groupx>
          </groupx>
        </groupy>
      </border>
    </panedyb>
  </PanelView>
)

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
