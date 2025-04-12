import { Bitmap } from "../core/bitmap.js"
import { Cursor } from "../core/cursor.js"
import type { Panel } from "../core/panel.js"
import { $, defRef, MaybeRef, Ref } from "../core/ref.js"
import { sys } from "../core/sys.js"
import type { Size } from "../core/types.js"
import { dragMove, dragResize } from "../util/drag.js"
import { MenuItem, showMenu } from "../util/menu.js"
import { Border } from "../views/border.js"
import { Button } from "../views/button.js"
import { GroupX } from "../views/group.js"
import { ImageView } from "../views/image.js"
import { Label } from "../views/label.js"
import { Margin } from "../views/margin.js"
import { PanedYA } from "../views/paned.js"
import { SpacedX } from "../views/spaced.js"
import type { View } from "../views/view.js"


const minImage = new Bitmap([0xffffff33], 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,])
const maxImage = new Bitmap([0xffffff33], 4, [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1,])
const axeImage = new Bitmap([0xffffff33], 4, [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,])
const mnuImage = new Bitmap([0xffffff33], 4, [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1])
const adjImage = new Bitmap([0xffffff77], 3, [0, 0, 1, 0, 0, 1, 1, 1, 1,])

const adjCursor = new Cursor(2, 2, new Bitmap([0x000000cc, 0xffffffff], 5, [
  0, 1, 1, 1, 0,
  1, 1, 2, 1, 1,
  1, 2, 2, 2, 1,
  1, 1, 2, 1, 1,
  0, 1, 1, 1, 0,
]))

export function PanelView(data: {
  title: MaybeRef<string>,
  children: View,
  size?: MaybeRef<Size>,
  presented?: (panel: Panel) => void,
  onKeyPress?: (key: string) => boolean,
  menuItems?: () => MenuItem[],
}) {

  const $size = defRef(data.size ?? $({ w: 200, h: 150 }))

  let panel: Panel

  const focused = $(false)
  const borderColor = focused.adapt<number>(b => b ? 0x005599ff : 0x00559944)

  return (
    <Margin
      onKeyPress={data.onKeyPress}
      paddingColor={borderColor}
      padding={1}
      size={$size}
      presented={async function (p) {
        panel = p
        data.presented?.(p)
      }}
      onPanelFocus={() => focused.val = true}
      onPanelBlur={() => focused.val = false}
      background={0x111111ff}
    >
      <PanedYA gap={-0}>

        <SpacedX
          canMouse
          onMouseDown={function () {
            this.onMouseUp = dragMove(sys.$mouse, panel.$point)
          }}
          background={0x1199ff33}
        >
          <Border>
            <GroupX gap={1}>
              <Button onClick={function () {
                const items = data.menuItems?.()
                if (items?.length) showMenu(items, {
                  x: this.screenPoint.x,
                  y: this.screenPoint.y + this.size.h,
                })
              }} padding={2}><ImageView bitmap={mnuImage} /></Button>
              <Label text={data.title} />
            </GroupX>
          </Border>
          <Border>
            <GroupX>
              <Button padding={2} onClick={() => panel.minimize()}>
                <ImageView bitmap={minImage} />
              </Button>
              <Button padding={2} onClick={() => panel.maximize()}>
                <ImageView bitmap={maxImage} />
              </Button>
              <Button padding={2} onClick={() => panel.close()} hoverBackground={0x99000055} pressBackground={0x44000099}>
                <ImageView bitmap={axeImage} />
              </Button>
            </GroupX>
          </Border>
        </SpacedX>

        <Margin padding={0}>
          <Margin background={0x222222ff}>
            {data.children}
          </Margin>
        </Margin>

      </PanedYA>

      <PanelResizer size={$size} />

    </Margin>
  )

}

function PanelResizer(data: { size: Ref<Size> }) {

  let panel: Panel

  function resizerMouseDown(this: ImageView, button: number) {
    panel.pushCursor(adjCursor)
    const done = dragResize(panel.$mouse, panel.$size)
    this.onMouseUp = () => {
      panel.popCursor(adjCursor)
      done()
      delete this.onMouseUp
    }
  }

  return <ImageView
    canMouse
    presented={p => panel = p}
    bitmap={adjImage}
    onMouseEnter={function (this: View) { panel.pushCursor(adjCursor) }}
    onMouseExit={function (this: View) { panel.popCursor(adjCursor) }}
    point={defRef(data.size).adapt(s => ({
      x: s.w - adjImage.width,
      y: s.h - adjImage.height,
    }))}
    onMouseDown={resizerMouseDown}
  />

}

