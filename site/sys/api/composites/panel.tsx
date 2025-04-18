import { Bitmap } from "../core/bitmap.js"
import { Cursor } from "../core/cursor.js"
import { currentAppPath } from "../core/open.js"
import type { Panel } from "../core/panel.js"
import { preferences } from "../core/preferences.js"
import { $, defRef, MaybeRef, Ref } from "../core/ref.js"
import { program, sys } from "../core/sys.js"
import { sizeEquals, type Point, type Size } from "../core/types.js"
import { fs } from "../fs/fs.js"
import { dragMove, dragResize } from "../util/drag.js"
import { MenuItem, showMenu } from "../util/menu.js"
import { showPrompt } from "../util/prompt.js"
import { Border } from "../views/border.js"
import { Button } from "../views/button.js"
import { GroupX } from "../views/group.js"
import { ImageView } from "../views/image.js"
import { Label } from "../views/label.js"
import { Margin } from "../views/margin.js"
import { PanedYA } from "../views/paned.js"
import { SpacedX } from "../views/spaced.js"
import type { View } from "../views/view.js"


export function PanelViewComp(data: {
  file?: PanelFile,
  children: View,
  size?: MaybeRef<Size>,
  presented?: (panel: Panel) => void,
  onKeyPress?: (key: string) => boolean,
  menuItems?: () => MenuItem[],
}) {

  if (data.file) {
    const file = data.file

    async function load() {
      const path = await showPrompt(panel, 'file path?')
      if (!path) return
      sys.launch(program.opts["app"], path)
    }

    async function save() {
      if (!file.$path.val) return saveAs()
      fs.putFile(file.$path.val, file.getContents())
    }

    async function saveAs() {
      const path = await askFilePath()
      if (!path) return
      file.$path.val = path
      fs.putFile(file.$path.val, file.getContents())
      sys.noteCurrentFile(file.$path.val)
    }

    async function askFilePath() {
      return await showPrompt(panel, 'file path?') ?? undefined
    }

    const oldMenuItems = data.menuItems
    data.menuItems = () => {
      const items = oldMenuItems?.() ?? []
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

    const oldKeyPress = data.onKeyPress
    data.onKeyPress = (key: string) => {
      if (key === 'ctrl o') { load(); return true }
      if (key === 'ctrl s') { save(); return true }
      if (key === 'ctrl S') { saveAs(); return true }
      return oldKeyPress?.(key) ?? false
    }

  }

  const $focused = $(false)
  const $title = $('')
  let panel: Panel

  return (
    <Margin
      onKeyPress={data.onKeyPress}
      paddingColor={$focused.adapt<number>(b => b ? 0x005599ff : 0x00559944)}
      padding={1}
      size={defRef(data.size ?? $({ w: 200, h: 150 }, sizeEquals))}
      presented={async function (p) {
        panel = p
        data.presented?.(p)

        const initial = p.name
        $title.defer(p.$name)

        const file = data.file
        if (file) {
          p.$name.defer(file.$path.adapt(() =>
            `${initial}: ${file.$path.val ?? '[no file]'}`
          ))
        }
      }}
      onPanelFocus={() => $focused.val = true}
      onPanelBlur={() => $focused.val = false}
      background={0x111111ff}
    >
      <PanedYA>
        <panel-titlebar panelFocused={$focused} title={$title} menuItems={data.menuItems} />
        <panel-body panelFocused={$focused}>{data.children}</panel-body>
      </PanedYA>
      <panel-resizer panelFocused={$focused} />
    </Margin>
  )
}


const minImage = new Bitmap([0xffffff33], 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,])
const maxImage = new Bitmap([0xffffff33], 4, [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1,])
const axeImage = new Bitmap([0xffffff33], 4, [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,])
const mnuImage = new Bitmap([0xffffff33], 4, [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1])

export function PanelTitlebarComp(data: {
  title: MaybeRef<string>
  menuItems?: () => MenuItem[]
}) {
  let clicks = 0
  let counter: number | undefined

  function click() {
    clicks++
    clearTimeout(counter)
    counter = setTimeout(() => { clicks = 0 }, 333)
  }

  const showSource = () => {
    sys.launch('sys/apps/editor.app.js', currentAppPath)
  }

  return <SpacedX
    canMouse
    onMouseDown={function () {
      click()
      if (clicks === 1) {
        this.onMouseUp = dragMove(sys.$mouse, this.panel!.$point)
      }
      else if (clicks === 2) {
        this.panel!.maximize()
      }
    }}
    background={0x1199ff33}
  >
    <Border>
      <GroupX gap={1}>
        <Button onClick={function () {
          const panelItems: MenuItem[] = [
            { text: 'view source', onClick: showSource },
          ]

          const items = data.menuItems?.()
          if (items) panelItems.push('-', ...items)

          showMenu(this.panel!, panelItems, {
            x: this.panelOffset.x,
            y: this.panelOffset.y + this.size.h,
          })
        }} padding={2}><ImageView bitmap={mnuImage} /></Button>
        <Label text={data.title} />
      </GroupX>
    </Border>
    <Border>
      <GroupX>
        <Button padding={2} onClick={function () { this.panel?.minimize() }}>
          <ImageView bitmap={minImage} />
        </Button>
        <Button padding={2} onClick={function () { this.panel?.maximize() }}>
          <ImageView bitmap={maxImage} />
        </Button>
        <Button padding={2} onClick={function () { this.panel?.close() }} hoverBackground={0x99000055} pressBackground={0x44000099}>
          <ImageView bitmap={axeImage} />
        </Button>
      </GroupX>
    </Border>
  </SpacedX>
}

preferences['panel-body-gap'] = 0
preferences['panel-body-gap-color'] = 0x00000000

export function PanelBodyComp(data: {
  children: any
  panelFocused: Ref<boolean>
}) {
  return <Margin
    padding={preferences['panel-body-gap']}
    paddingColor={
      data.panelFocused.adapt(f => {
        return preferences[f
          ? 'panel-body-gap-color-focused'
          : 'panel-body-gap-color-unfocused'
        ] ?? preferences['panel-body-gap-color']
      })
    }
  >
    <Margin background={0x222222ff}>
      {data.children}
    </Margin>
  </Margin>
}


const adjImage = new Bitmap([0xffffff77], 3, [0, 0, 1, 0, 0, 1, 1, 1, 1,])

const adjCursor = new Cursor(2, 2, new Bitmap([0x000000cc, 0xffffffff], 5, [
  0, 1, 1, 1, 0,
  1, 1, 2, 1, 1,
  1, 2, 2, 2, 1,
  1, 1, 2, 1, 1,
  0, 1, 1, 1, 0,
]))

export function PanelResizerComp(data: { panelFocused: Ref<boolean> }) {
  return <ImageView
    canMouse
    presented={function (panel) {
      this.$point.defer(panel.$size.adapt<Point>(s => ({
        x: s.w - this.size.w,
        y: s.h - this.size.h,
      })))
    }}
    bitmap={adjImage}
    alpha={data.panelFocused.adapt<number>(f => f ? 1 : 0.3)}
    onMouseEnter={function () { this.panel!.pushCursor(adjCursor) }}
    onMouseExit={function () { this.panel!.popCursor(adjCursor) }}
    onMouseDown={function (b) {
      const panel = this.panel!
      panel.pushCursor(adjCursor)
      const done = dragResize(panel.$mouse, panel.$size)
      this.onMouseUp = () => {
        panel.popCursor(adjCursor)
        done()
        delete this.onMouseUp
      }
    }}
  />
}


export interface PanelFile {
  $path: Ref<string | undefined>,
  getContents: () => string,
}
