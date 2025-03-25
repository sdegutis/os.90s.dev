import { Panel } from "../client/core/panel.js"
import { PanelView } from "../client/util/panelview.js"
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
      <view background={0x99000099} />
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
