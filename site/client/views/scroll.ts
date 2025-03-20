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

    const area = make(view, { background: 0x000033ff, onChildResized: fixAll, children: [content] })

    const barv = make(view, { w: 3, background: 0xffffff33 })
    const barh = make(view, { h: 3, background: 0xffffff33 })

    const trackv = make(view, { w: 3, background: 0x330000ff, children: [barv] })
    const trackh = make(view, { h: 3, background: 0x003300ff, children: [barh] })
    const corner = make(view, { h: 3, background: 0x333300ff })

    const adjustTracks = () => {
      const ph = Math.min(1, perh.val)
      const pw = Math.min(1, perw.val)

      const h = Math.max(3, Math.floor(trackv.h * ph))
      const y = Math.floor(trackv.h - h) * (scrolly.val / (content.h - area.h))
      barv.set('visible', ph < 1)
      barv.set('y', y)
      barv.set('h', h)

      const w = Math.max(3, Math.floor(trackh.w * pw))
      const x = Math.floor(trackh.w - w) * (scrollx.val / (content.w - area.w))
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
      scrollx.val = Math.max(0, Math.min(content.w - area.w, scrollx.val))
      scrolly.val = Math.max(0, Math.min(content.h - area.h, scrolly.val))
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

  // readonly area = make(view, {})

  // readonly trackx = make(view, { w: 3, background: 0xffffff22, onMouseDown: () => this.dragTrack(this.trackx) })
  // readonly tracky = make(view, { h: 3, background: 0xffffff22, onMouseDown: () => this.dragTrack(this.tracky) })

  // readonly barx = make(view, { w: 3, background: 0x00000099, children: [this.trackx] })
  // readonly bary = make(view, { h: 3, background: 0x00000099, children: [this.tracky] })

  // readonly content!: view

  // override init(): void {
  //   this.addLayoutKeys('scrollx', 'scrolly')

  //   this.set('content', this.children[0]!)
  //   this.area.set('children', [this.content])

  //   const mthis = this.mutable()
  //   mthis.children = [this.area, this.barx, this.bary]
  //   mthis.commit()
  // }

  // override onResized(): void {
  //   this.adjustTracks()
  // }

  // override onChildResized(): void {
  //   this.adjust?.()
  //   this.layout()
  // }

  // private adjustTracks() {
  //   const trackx = this.trackx.mutable()
  //   const tracky = this.tracky.mutable()

  //   const py = Math.min(1, this.h / this.content.h)
  //   trackx.y = Math.round(this.scrolly / (this.content.h - this.h) * this.barx.h * (1 - py))
  //   trackx.h = Math.round(this.barx.h * py)

  //   const px = Math.min(1, this.w / this.content.w)
  //   tracky.x = Math.round(this.scrollx / (this.content.w - this.w) * this.bary.w * (1 - px))
  //   tracky.w = Math.round(this.bary.w * px)

  //   trackx.commit()
  //   tracky.commit()
  // }

  // private dragTrack(track: view) {
  //   // const o = { y: this.trackx.y, x: this.tracky.x }
  //   // const drag = dragMove(o)
  //   // const move = () => {
  //   //   drag()

  //   //   if (track === this.trackx) this.scrolly = Math.round((o.y / (this.barx.h - this.trackx.h)) * this.firstChild!.h)
  //   //   if (track === this.tracky) this.scrollx = Math.round((o.x / (this.bary.w - this.tracky.w)) * this.firstChild!.w)
  //   // }
  //   // const up = () => {
  //   //   setTimeout(() => { this.scrollVisibleClaims-- }, 500)
  //   // }
  //   // sys.trackMouse({ move, up })
  // }

  // override layout(): void {
  //   if (!this.content) return

  //   const content = this.content.mutable()
  //   const area = this.area.mutable()
  //   const barx = this.barx.mutable()
  //   const bary = this.bary.mutable()
  //   const trackx = this.trackx.mutable()
  //   const tracky = this.tracky.mutable()

  //   area.w = this.w - barx.w
  //   area.h = this.h - bary.h

  //   this.fixScrollPos()
  //   content.x = -this.scrollx
  //   content.y = -this.scrolly

  //   barx.x = this.w - barx.w
  //   barx.y = 0
  //   barx.h = this.h - bary.h

  //   bary.y = this.h - bary.h
  //   bary.x = 0
  //   bary.w = this.w - barx.w

  //   trackx.x = 0
  //   trackx.w = barx.w

  //   tracky.y = 0
  //   tracky.h = bary.h

  //   content.commit()
  //   area.commit()
  //   barx.commit()
  //   bary.commit()
  //   trackx.commit()
  //   tracky.commit()

  //   this.adjustTracks()
  // }

}
