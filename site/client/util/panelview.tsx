import { Bitmap } from "/client/core/bitmap.js"
import { Cursor } from "/client/core/cursor.js"
import type { Panel } from "/client/core/panel.js"
import { $, multiplex, Ref } from "/client/core/ref.js"
import { program, sys } from "/client/core/sys.js"
import type { Size } from "/client/core/types.js"
import { dragMove, dragResize } from "/client/util/drag.js"
import { showMenu, type MenuItem } from "/client/util/menu.js"
import { showPrompt } from "/client/util/prompt.js"
import type { ImageView } from "/client/views/image.js"
import type { SpacedX } from "/client/views/spaced.js"
import type { View } from "/client/views/view.js"


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
    <margin
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
      <panedya gap={-1}>

        <spacedx canMouse onMouseDown={titleBarMouseDown}>
          <border>
            <groupx gap={1}>
              <button onClick={function () {
                const items = data.menuItems?.()
                if (items?.length) showMenu(items, {
                  x: this.panel!.point.x + this.panelOffset.x + this.point.x,
                  y: this.panel!.point.y + this.panelOffset.y + this.point.y + this.size.h,
                })
              }} padding={2}><image bitmap={mnuImage} /></button>
              <label text={data.title} />
            </groupx>
          </border>
          <border>
            <groupx>
              <button padding={2} onClick={minw}><image bitmap={minImage} /></button>
              <button padding={2} onClick={maxw}><image bitmap={maxImage} /></button>
              <CloseB padding={2} onClick={axew}><image bitmap={axeImage} /></CloseB>
            </groupx>
          </border>
        </spacedx>

        <margin padding={1}>
          <margin background={0x222222ff}>
            {data.children}
          </margin>
        </margin>

      </panedya>

      <PanelResizer size={size} />

    </margin>
  )

}

function CloseB(data: JSX.DataFor<'button'>) {
  return <button {...data} hoverBackground={0x99000055} pressBackground={0x44000099} />
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

  return <image
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
