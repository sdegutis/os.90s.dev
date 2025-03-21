import { dragMove } from "../util/drag.js"
import { vacuumFirstChild } from "../util/layout.js"
import { panedxb, panedyb } from "./paned.js"
import { make, view } from "./view.js"

export class scroll extends view {

  scrollBy: number = 6

  scrollx: number = 0
  scrolly: number = 0

  area!: view

  override init(): void {
    let perw = 0
    let perh = 0

    const content = this.children[0]

    const area = make(view, { passthrough: true, onChildResized: fixAll, children: [content] })
    this.area = area

    const barv = make(view, { size: { w: 3, h: 0 }, background: 0xffffff33 })
    const barh = make(view, { size: { h: 3, w: 0 }, background: 0xffffff33 })

    const trackv = make(view, { size: { w: 3, h: 0 }, background: 0x00000033, children: [barv] })
    const trackh = make(view, { size: { h: 3, w: 0 }, background: 0x00000033, children: [barh] })
    const corner = make(view, { size: { h: 3, w: 0 }, background: 0x00000033 })

    const makeTrackDraggable = (xy: 'x' | 'y') => {
      const wh = xy === 'x' ? 'w' : 'h'
      const bar = xy === 'x' ? barh : barv
      const track = xy === 'x' ? trackh : trackv
      const scroll = xy === 'x' ? 'scrollx' : 'scrolly'

      bar.onMouseUp = () => delete bar.onMouseMove
      bar.onMouseDown = (b, pos) => {
        if (b !== 0) return
        bar.onMouseMove = dragMove(pos, {
          x: bar.point.x,
          y: bar.point.y,
          move: (x, y) => {
            const per = { x, y }[xy] / (track.size[wh] - bar.size[wh])
            this[scroll] = per * (content.size[wh] - area.size[wh])
            adjustTracks()
          }
        })
      }
    }

    makeTrackDraggable('x')
    makeTrackDraggable('y')

    const adjustTracks = () => {
      const ph = Math.min(1, perh)
      const h = Math.max(3, Math.floor(trackv.size.h * ph))
      const y = Math.floor((trackv.size.h - h) * (this.scrolly / (content.size.h - area.size.h)))
      barv.visible = ph < 1
      barv.point = { x: barv.point.x, y }
      barv.size = { w: barv.size.w, h }

      const pw = Math.min(1, perw)
      const w = Math.max(3, Math.floor(trackh.size.w * pw))
      const x = Math.floor((trackh.size.w - w) * (this.scrollx / (content.size.w - area.size.w)))
      barh.visible = pw < 1
      barh.point = { x, y: barh.point.y }
      barh.size = { w, h: barh.size.h }
    }

    this.children = [make(panedxb, {
      children: [
        make(panedyb, { children: [area, trackh] }),
        make(panedyb, { children: [trackv, corner], size: { h: 0, w: trackv.size.w } })
      ],
    })]

    const layout = this.layout = () => {
      console.log('what')

      vacuumFirstChild.apply(this)
      content.point = {
        x: -this.scrollx,
        y: -this.scrolly,
      }
    }

    const didScroll = () => {
      const scrollx = Math.floor(Math.max(0, Math.min(content.size.w - area.size.w, this.scrollx)))
      const scrolly = Math.floor(Math.max(0, Math.min(content.size.h - area.size.h, this.scrolly)))
      if (scrollx !== this.scrollx) this.scrollx = scrollx
      if (scrolly !== this.scrolly) this.scrolly = scrolly
      adjustTracks()
      layout()
      this.panel?.needsRedraw()
    }

    this.onWheel = (px, py) => {
      px = px / 100 * this.scrollBy
      py = py / 100 * this.scrollBy
      if (this.panel?.isKeyDown('Shift')) [px, py] = [py, px]

      this.scrollx += px
      this.scrolly += py

      adjustTracks()
    }

    this.$watch('size', fixAll)
    this.$watch('scrollx', didScroll)
    this.$watch('scrolly', didScroll)

    function fixAll() {
      layout()
      didScroll()
      setTimeout(() => {
        perw = area.size.w / content.size.w
        perh = area.size.h / content.size.h
        adjustTracks()
      })
    }

  }

}
