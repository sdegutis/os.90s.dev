import { JsxAttrs } from "../core/jsx.js"
import { $, makeRef, multiplex } from "../core/ref.js"
import { sys } from "../core/sys.js"
import { xresize, yresize } from "../util/cursors.js"
import { dragMove } from "../util/drag.js"
import { Button } from "./button.js"
import { View } from "./view.js"

export class Scroll extends View {

  constructor(config?: JsxAttrs<Scroll>) {
    super()
    this.canMouse = true
    this.setup(config)
  }

  override init(): void {
    super.init()

    this.children = [this.content, this.trackv, this.trackh, this.corner]

    // setInterval(() => { this.$showh.val = !this.$showh.val }, 3000)
    // setInterval(() => { this.$showv.val = !this.$showv.val }, 2000)

    this.trackh.$visible.defer(this.$showh)
    this.trackv.$visible.defer(this.$showv)
    this.corner.$visible.defer(multiplex([this.$showh, this.$showv], (h, v) => h || v))

    this.trackv.$point.defer(this.$size.adapt(size => ({ x: size.w - 3, y: 0 })))
    this.trackh.$point.defer(this.$size.adapt(size => ({ x: 0, y: size.h - 3 })))

    this.trackv.$size.defer(this.$size.adapt(size => ({ w: 3, h: size.h - 3 })))
    this.trackh.$size.defer(this.$size.adapt(size => ({ w: size.w - 3, h: 3 })))

    this.corner.$point.defer(this.$size.adapt(size => ({ x: size.w - 3, y: size.h - 3 })))

    const $perc = multiplex([this.$size, this.content.$size], (mySize, contentSize) => {
      const pw = Math.min(1, mySize.w / contentSize.w)
      const ph = Math.min(1, mySize.h / contentSize.h)
      return { w: pw, h: ph }
    })

    this.barv.$visible.defer($perc.adapt(p => p.h < 1))
    this.barh.$visible.defer($perc.adapt(p => p.w < 1))

    this.barv.$size.defer(multiplex([$perc, this.trackv.$size], (p, s) => ({ w: 3, h: Math.floor(p.h * s.h) })))
    this.barh.$size.defer(multiplex([$perc, this.trackh.$size], (p, s) => ({ w: Math.floor(p.w * s.w), h: 3 })))

    this.barv.$point.defer(multiplex([$perc, this.$scrolly], (p, y) => ({ x: 0, y: Math.floor(p.h * y) })))
    this.barh.$point.defer(multiplex([$perc, this.$scrollx], (p, x) => ({ x: Math.floor(p.w * x), y: 0 })))

    for (const xy of ['x', 'y'] as const) {
      const wh = xy === 'x' ? 'w' : 'h'
      const bar = xy === 'x' ? this.barh : this.barv
      const track = xy === 'x' ? this.trackh : this.trackv
      const scroll = xy === 'x' ? 'scrollx' : 'scrolly'

      const cursor = xy === 'x' ? xresize : yresize

      bar.onMouseEnter = () => this.panel?.pushCursor(cursor)
      bar.onMouseExit = () => this.panel?.popCursor(cursor)

      bar.onMouseDown = (b) => {
        if (b !== 0) return
        this.panel?.pushCursor(cursor)
        const view = this

        const $point = $(bar.point)
        const done = dragMove(this.panel!.$mouse, $point)

        $point.watch(p => {
          const per = p[xy] / (track.size[wh] - bar.size[wh])
          view[scroll] = per * (view.content.size[wh] - view.size[wh])
        })

        bar.onMouseUp = () => {
          this.panel?.popCursor(cursor)
          done()
        }
      }
    }

    this.$scrollx.intercept((x) => Math.floor(Math.max(0, Math.min(this.content.size.w - this.size.w, x))), [this.content.$size, this.$size])
    this.$scrolly.intercept((y) => Math.floor(Math.max(0, Math.min(this.content.size.h - this.size.h, y))), [this.content.$size, this.$size])

    multiplex([this.$scrollx, this.$scrolly], (x, y) => {
      this.content.point = { x: -x, y: -y }
    })
  }

  scrollBy: number = 6 * 3

  scrollx = 0; $scrollx = makeRef(this, 'scrollx')
  scrolly = 0; $scrolly = makeRef(this, 'scrolly')
  showh = true; $showh = makeRef(this, 'showh')
  showv = true; $showv = makeRef(this, 'showv')

  get content() { return this.firstChild! }

  barv = new Button({ adjust: () => { }, background: 0xffffff33, pressBackground: 0xffffff11, hoverBackground: 0xffffff22, padding: 1, paddingColor: 0xffffff11 })
  barh = new Button({ adjust: () => { }, background: 0xffffff33, pressBackground: 0xffffff11, hoverBackground: 0xffffff22, padding: 1, paddingColor: 0xffffff11 })

  trackv = new View({ background: 0x00000033, children: [this.barv] })
  trackh = new View({ background: 0x00000033, children: [this.barh] })
  corner = new View({ background: 0x00000033, size: { w: 3, h: 3 } })

  override onWheel(px: number, py: number): void {
    px = px / 100 * this.scrollBy
    py = py / 100 * this.scrollBy
    if (sys.pressedKeys.has('Shift')) [px, py] = [py, px]
    this.scrollx += px
    this.scrolly += py
  }

}
