import { useCursor, xresize, yresize } from "../util/cursors.js"
import { dragMove } from "../util/drag.js"
import { vacuumFirstChild } from "../util/layout.js"
import { multiplex } from "../util/ref.js"
import { PanedXB, PanedYB } from "./paned.js"
import { make, View } from "./view.js"

export class Scroll extends View {

  scrollBy: number = 6

  scrollx: number = 0
  scrolly: number = 0

  content!: View
  area = make(View, { passthrough: true })

  barv = make(View, { size: { w: 3, h: 0 }, background: 0xffffff33, pressBackground: 0xffffff11, hoverBackground: 0xffffff22 })
  barh = make(View, { size: { w: 0, h: 3 }, background: 0xffffff33, pressBackground: 0xffffff11, hoverBackground: 0xffffff22 })

  trackv = make(View, { background: 0x00000033, children: [this.barv] })
  trackh = make(View, { background: 0x00000033, children: [this.barh] })
  corner = make(View, { background: 0x00000033, size: { w: 0, h: 3 } })

  showh = true
  showv = true

  override init(): void {
    this.content = this.children[0]
    this.area.children = [this.content]

    const panea = make(PanedYB, { children: [this.area, this.trackh] })
    const paneb = make(PanedYB, { children: [this.trackv, this.corner] })
    this.children = [make(PanedXB, { children: [panea, paneb] })]

    const reflectTracksShown = () => {
      this.trackh.size = { w: 0, h: this.showh ? 3 : 0 }
      this.corner.size = { w: 0, h: this.showh ? 3 : 0 }
      paneb.size = { w: this.showv ? 3 : 0, h: 0 }
    }

    reflectTracksShown()
    this.$watch('showh', reflectTracksShown)
    this.$watch('showv', reflectTracksShown)

    const percent = multiplex([
      this.area.$ref('size'),
      this.content.$ref('size'),
    ], () => ({
      w: this.area.size.w / this.content.size.w,
      h: this.area.size.h / this.content.size.h,
    }))

    multiplex([
      percent,
      this.$ref('scrollx'),
      this.$ref('scrolly'),
    ], () => {
      const as = this.area.size

      const ph = Math.min(1, percent.val.h)
      const h = Math.max(3, Math.floor(as.h * ph))
      const y = Math.floor((as.h - h) * (this.scrolly / (this.content.size.h - as.h)))
      this.barv.visible = ph < 1
      this.barv.point = { x: this.barv.point.x, y }
      this.barv.size = { w: this.barv.size.w, h }

      const pw = Math.min(1, percent.val.w)
      const w = Math.max(3, Math.floor(as.w * pw))
      const x = Math.floor((as.w - w) * (this.scrollx / (this.content.size.w - as.w)))
      this.barh.visible = pw < 1
      this.barh.point = { x, y: this.barh.point.y }
      this.barh.size = { w, h: this.barh.size.h }
    })

    for (const xy of ['x', 'y'] as const) {
      const wh = xy === 'x' ? 'w' : 'h'
      const bar = xy === 'x' ? this.barh : this.barv
      const track = xy === 'x' ? this.trackh : this.trackv
      const scroll = xy === 'x' ? 'scrollx' : 'scrolly'

      const cursor = useCursor(this, xy === 'x' ? xresize : yresize)

      bar.onMouseEnter = () => cursor.push()
      bar.onMouseExit = () => cursor.pop()

      bar.onMouseDown = (b, pos) => {
        if (b !== 0) return
        cursor.push()
        const view = this
        bar.onMouseMove = dragMove(pos, {
          get point() { return bar.point },
          set point(p: { x: number, y: number }) {
            const per = p[xy] / (track.size[wh] - bar.size[wh])
            view[scroll] = per * (view.content.size[wh] - view.area.size[wh])
          }
        })
      }

      bar.onMouseUp = () => {
        cursor.pop()
        delete bar.onMouseMove
      }
    }

    paneb.$watch('size', () => this.constrainContent())
    this.content.$watch('size', () => this.constrainContent())
    this.$watch('size', () => this.constrainContent())
    this.$watch('scrollx', () => this.constrainContent())
    this.$watch('scrolly', () => this.constrainContent())
  }

  private constrainContent() {
    const scrollx = Math.floor(Math.max(0, Math.min(this.content.size.w - this.area.size.w, this.scrollx)))
    const scrolly = Math.floor(Math.max(0, Math.min(this.content.size.h - this.area.size.h, this.scrolly)))
    if (scrollx !== this.scrollx) this.scrollx = scrollx
    if (scrolly !== this.scrolly) this.scrolly = scrolly
    this.layout()
  }

  override onWheel(px: number, py: number): void {
    px = px / 100 * this.scrollBy
    py = py / 100 * this.scrollBy
    if (this.panel?.isKeyDown('Shift')) [px, py] = [py, px]
    this.scrollx += px
    this.scrolly += py
  }

  override layout(): void {
    vacuumFirstChild.apply(this)
    this.content.point = {
      x: -this.scrollx,
      y: -this.scrolly,
    }
  }

}
