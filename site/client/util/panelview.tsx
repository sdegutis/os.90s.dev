import { Bitmap } from "../core/bitmap.js"
import { Cursor } from "../core/cursor.js"
import type { Panel } from "../core/panel.js"
import { $, multiplex, Ref } from "../core/ref.js"
import { program, sys } from "../core/sys.js"
import type { Size } from "../core/types.js"
import { Border } from "../views/border.js"
import { Button } from "../views/button.js"
import { GroupX } from "../views/group.js"
import { ImageView } from "../views/image.js"
import { Label } from "../views/label.js"
import { Margin } from "../views/margin.js"
import { PanedYA } from "../views/paned.js"
import { SpacedX } from "../views/spaced.js"
import type { View } from "../views/view.js"
import { dragMove, dragResize } from "./drag.js"
import { showMenu, type MenuItem } from "./menu.js"
import { showPrompt } from "./prompt.js"


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
  title: Ref<string>,
  children: View,
  size?: Ref<Size>,
  presented?: (panel: Panel) => void,
  onKeyDown?: (key: string) => boolean,
  menuItems?: () => MenuItem[],
}) {

  const size = data.size ?? $({ w: 200, h: 150 })

  let panel: Panel

  const focused = $(false)
  const borderColor = focused.adapt<number>(b => b ? 0x005599ff : 0x00559944)

  function titleBarMouseDown(this: SpacedX, button: number) {
    this.onMouseUp = dragMove(sys.$mouse, panel.$point)
  }

  function minw() { /* panel.min() */ }
  function maxw() { /* panel.max() */ }
  function axew() { panel.close() }

  return (
    <Margin
      onKeyDown={data.onKeyDown}
      paddingColor={borderColor}
      padding={1}
      size={size}
      presented={function (p) {
        panel = p
        data.presented?.(p)
      }}
      onPanelFocus={() => focused.val = true}
      onPanelBlur={() => focused.val = false}
      background={0x111111ff}
    >
      <PanedYA gap={-0}>

        <SpacedX canMouse onMouseDown={titleBarMouseDown} background={0x1199ff33}>
          <Border>
            <GroupX gap={1}>
              <Button onClick={function () {
                const items = data.menuItems?.()
                if (items?.length) showMenu(items, {
                  x: this.panel!.point.x + this.panelOffset.x + this.point.x,
                  y: this.panel!.point.y + this.panelOffset.y + this.point.y + this.size.h,
                })
              }} padding={2}><ImageView bitmap={mnuImage} /></Button>
              <Label text={data.title} />
            </GroupX>
          </Border>
          <Border>
            <GroupX>
              <Button padding={2} onClick={minw}><ImageView bitmap={minImage} /></Button>
              <Button padding={2} onClick={maxw}><ImageView bitmap={maxImage} /></Button>
              <CloseB padding={2} onClick={axew}><ImageView bitmap={axeImage} /></CloseB>
            </GroupX>
          </Border>
        </SpacedX>

        <Margin padding={0}>
          <Margin background={0x222222ff}>
            {data.children}
          </Margin>
        </Margin>

      </PanedYA>

      <PanelResizer size={size} />

    </Margin>
  )

}

function CloseB(data: ConstructorParameters<typeof Button>[0]) {
  return <Button {...data} hoverBackground={0x99000055} pressBackground={0x44000099} />
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
    point={data.size.adapt(s => ({
      x: s.w - adjImage.width,
      y: s.h - adjImage.height,
    }))}
    onMouseDown={resizerMouseDown}
  />

}


export function FilePanelView({
  filepath,
  filedata,
  title,
  menuItems,
  onKeyDown,
  presented,
  ...data
}: Parameters<typeof PanelView>[0] & {
  filepath: Ref<string | undefined>,
  filedata: () => string,
}) {
  let panel: Panel

  async function load() {
    const path = await showPrompt('file path?')
    if (!path) return
    sys.launch(program.opts["app"], path)
  }

  async function save() {
    if (!filepath.val) filepath.val = await askFilePath()
    if (!filepath.val) return
    sys.putfile(filepath.val, filedata())
  }

  async function saveAs() {
    const path = await askFilePath()
    if (!path) return
    filepath.val = path
    sys.putfile(filepath.val, filedata())
  }

  async function askFilePath() {
    return await showPrompt('file path?') ?? undefined
  }

  const fileMenu = () => {
    const items = menuItems?.() ?? []
    if (items.length > 0) {
      items.push('-')
    }
    items.push(
      { text: 'load...', onClick: load },
      { text: 'save as...', onClick: saveAs },
      { text: 'save', onClick: save },
    )
    return items
  }

  const keyHandler = (key: string) => {
    if (key === 'o' && panel.isKeyDown('Control')) { load(); return true }
    if (key === 's' && panel.isKeyDown('Control')) { save(); return true }
    if (key === 'S' && panel.isKeyDown('Control')) { saveAs(); return true }
    return onKeyDown?.(key) ?? false
  }

  const filetitle = multiplex([filepath, title], () => {
    return `${title.val}: ${filepath.val ?? '[no file]'}`
  })

  return <PanelView
    {...data}
    presented={p => {
      panel = p
      presented?.(p)
    }}
    onKeyDown={keyHandler}
    title={filetitle}
    menuItems={fileMenu}
  />
}
