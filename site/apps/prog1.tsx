import { Program } from "../client/core/prog.js"
import { dragMove, dragResize } from "../client/util/drag.js"
import { $, Ref } from "../client/util/ref.js"
import type { border } from "../client/views/border.js"
import { image } from "../client/views/image.js"
import type { spacedx } from "../client/views/spaced.js"
import type { Pos, view } from "../client/views/view.js"
import { Bitmap } from "../shared/bitmap.js"
import { Cursor } from "../shared/cursor.js"

const minImage = new Bitmap([0x333333ff], 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,])
const maxImage = new Bitmap([0x333333ff], 4, [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1,])
const axeImage = new Bitmap([0x333333ff], 4, [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,])
const adjImage = new Bitmap([0xffffff77], 3, [0, 0, 1, 0, 0, 1, 1, 1, 1,])
const menubuttonImage = new Bitmap([0x333333ff], 4, [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1])

const adjCursor = new Cursor(2, 2, new Bitmap([0x000000cc, 0xffffffff], 5, [
  0, 1, 1, 1, 0,
  1, 1, 2, 1, 1,
  1, 2, 2, 2, 1,
  1, 1, 2, 1, 1,
  0, 1, 1, 1, 0,
]))

const prog = new Program()
await prog.init()

const ch = $<view[]>([])

const children = $([
  <button padding={2}><label text={'hey'} /></button>,
  ...Array(20).keys().map(i => <label text={`view ${i.toString()}`} />)
])

// setInterval(() => {
//   children.val = children.val.toSpliced(children.val.length - 1, 1)

//   // ch.val = [...ch.val, <label text={Date.now().toString()} background={0x00003399} />]
// }, 1000)

const panel = await prog.makePanel({
  size: [100, 100],
  view: <PanelView title={'test panel'}>
    <scroll background={0x00330099}>
      <border background={0x00009999} padding={2}>
        <groupy gap={2} align={'a'}>
          {children}
        </groupy>
      </border>
    </scroll>

    {/* <panedya background={0x00330099}>
      <border padding={3} background={0x99000099}>
        <border padding={3} background={0x00009999}>
          <groupy gap={2} background={0x00003399} children={ch} />
        </border>
      </border>
      <label text={'yep'} background={0x33000099} />
    </panedya> */}
  </PanelView>,
})

function PanelView(data: { title: string | Ref<string>, children: view }) {

  const focused = $(false)
  const borderColor = focused.adapt<number>(b => b ? 0x005599ff : 0x00559944)

  function titleBarMouseDown(this: spacedx, button: number, pos: Pos) {
    this.onMouseMove = dragMove(pos, panel)
    this.onMouseUp = () => {
      delete this.onMouseMove
      delete this.onMouseUp
    }
  }

  function minw() { }

  function maxw() { }

  function axew() {
    panel.close()
  }

  function layoutContentView(this: border) {
    this.firstChild?.mutate(c => {
      c.x = 1
      c.y = 0
      c.w = this.w - 2
      c.h = this.h - 1
    })
  }

  const toplevel = {
    onPanelFocus: () => focused.val = true,
    onPanelBlur: () => focused.val = false,
    onResized(this: view) {
      const content = this.children[0].children[0]
      content.mutate(c => {
        c.w = this.w - 2
        c.h = this.h - 2
      })
      this.layoutTree()
    },
  }

  function PanelResizer() {

    let claims = 0
    function setClaims(n: number) {
      claims += n
      if (claims === 0) {
        panel.setCursor(null)
      }
      else if (claims === n) {
        panel.setCursor(adjCursor)
      }
    }

    function resizerMouseDown(this: image, button: number, pos: Pos) {
      setClaims(1)
      this.onMouseMove = dragResize(pos, panel)
      this.onMouseUp = () => {
        setClaims(-1)
        delete this.onMouseMove
        delete this.onMouseUp
      }
    }

    return <image
      passthrough={false}
      bitmap={adjImage}
      onMouseEnter={() => setClaims(+1)}
      onMouseExit={() => setClaims(-1)}
      layout={function () {
        if (!this.parent) return
        const mthis = this.mutable()
        mthis.x = this.parent!.w - this.w
        mthis.y = this.parent!.h - this.h
        mthis.commit()
      }}
      onMouseDown={resizerMouseDown}
    />
  }

  return <view background={0x070707dd} {...toplevel}>
    <border borderColor={borderColor} padding={1}>

      <panedya gap={0}>

        <spacedx onMouseDown={titleBarMouseDown}>
          <border>
            <groupx gap={1}>
              <button padding={2}><image bitmap={menubuttonImage} /></button>
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

        <border layout={layoutContentView}>
          {data.children}
        </border>

      </panedya>

      <PanelResizer />

    </border>
  </view>

  function CloseB(data: JSX.DataFor<'button'>) {
    return <button {...data} hoverBackground={0x99000055} pressBackground={0x44000099} />
  }

}
