import { dragMove } from "../util/drag.js"
import { $ } from "../util/ref.js"
import { panedxb, panedyb } from "./paned.js"
import { make, view } from "./view.js"

export class scroll extends view {

  readonly scrollBy: number = 6

  override init(): void {
    const scrollx = $(0)
    const scrolly = $(0)

    const perw = $(0)
    const perh = $(0)

    const content = this.children[0]

    const area = make(view, { onChildResized: fixAll, children: [content] })

    const barv = make(view, { w: 3, background: 0xffffff33 })
    const barh = make(view, { h: 3, background: 0xffffff33 })

    const trackv = make(view, { w: 3, background: 0x00000033, children: [barv] })
    const trackh = make(view, { h: 3, background: 0x00000033, children: [barh] })
    const corner = make(view, { h: 3, background: 0x00000033 })

    function makeTrackDraggable(xy: 'x' | 'y') {
      const wh = xy === 'x' ? 'w' : 'h'
      const bar = xy === 'x' ? barh : barv
      const track = xy === 'x' ? trackh : trackv
      const scroll = xy === 'x' ? scrollx : scrolly

      bar.onMouseUp = () => delete bar.onMouseMove
      bar.onMouseDown = (b, pos) => {
        if (b !== 0) return
        bar.onMouseMove = dragMove(pos, {
          x: bar.x,
          y: bar.y,
          move(x, y) {
            const per = { x, y }[xy] / (track[wh] - bar[wh])
            scroll.val = per * (content[wh] - area[wh])
            fixScrollVals()
            adjustTracks()
          }
        })
      }
    }

    makeTrackDraggable('x')
    makeTrackDraggable('y')

    const adjustTracks = () => {
      const ph = Math.min(1, perh.val)
      const pw = Math.min(1, perw.val)

      const h = Math.max(3, Math.floor(trackv.h * ph))
      const y = Math.floor((trackv.h - h) * (scrolly.val / (content.h - area.h)))
      barv.set('visible', ph < 1)
      barv.set('y', y)
      barv.set('h', h)

      const w = Math.max(3, Math.floor(trackh.w * pw))
      const x = Math.floor((trackh.w - w) * (scrollx.val / (content.w - area.w)))
      barh.set('visible', pw < 1)
      barh.set('x', x)
      barh.set('w', w)
    }

    perh.watch(adjustTracks)
    perw.watch(adjustTracks)

    this.set('children',
      [make(panedxb, {
        children: [
          make(panedyb, { children: [area, trackh] }),
          make(panedyb, { children: [trackv, corner], w: trackv.w })
        ],
      })]
    )

    const layout = this.layout = () => {
      this.firstChild?.mutate(v => {
        v.x = 0
        v.y = 0
        v.w = this.w
        v.h = this.h
      })

      content.set('x', -scrollx.val)
      content.set('y', -scrolly.val)
    }

    const fixScrollVals = () => {
      scrollx.val = Math.floor(Math.max(0, Math.min(content.w - area.w, scrollx.val)))
      scrolly.val = Math.floor(Math.max(0, Math.min(content.h - area.h, scrolly.val)))
    }

    this.onWheel = (px, py) => {
      px = px / 100 * this.scrollBy
      py = py / 100 * this.scrollBy
      if (this.panel?.keymap.has('Shift')) [px, py] = [py, px]
      scrollx.val += px
      scrolly.val += py
      fixScrollVals()
      adjustTracks()
    }

    scrollx.watch((x) => { layout(); this.panel?.needsRedraw() })
    scrolly.watch((y) => { layout(); this.panel?.needsRedraw() })

    this.onResized = fixAll

    function fixAll(this: view) {
      fixScrollVals()
      layout()
      setTimeout(() => {
        perw.val = area.w / content.w
        perh.val = area.h / content.h
      })
    }

  }

}
