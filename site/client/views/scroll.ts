import { view } from "./view.js"

export class scroll extends view {

  scrollBy: number = 6

  scrollx: number = 0
  scrolly: number = 0

  private _area!: view
  get area() { return this._area }

  override init(): void {
    let perw = 0
    let perh = 0

    const content = this.children[0]

    // const area = make(view, { passthrough: true, onChildResized: fixAll, children: [content] })
    // this._area = area

    // const barv = make(view, { /* size.w: 3, */ background: 0xffffff33 })
    // const barh = make(view, { /* size.h: 3, */ background: 0xffffff33 })

    // const trackv = make(view, { /* size.w: 3, */ background: 0x00000033, children: [barv] })
    // const trackh = make(view, { /* size.h: 3, */ background: 0x00000033, children: [barh] })
    // const corner = make(view, { /* size.h: 3, */ background: 0x00000033 })

    // const makeTrackDraggable = (xy: 'x' | 'y') => {
    //   const wh = xy === 'x' ? 'w' : 'h'
    //   const bar = xy === 'x' ? barh : barv
    //   const track = xy === 'x' ? trackh : trackv
    //   const scroll = xy === 'x' ? 'scrollx' : 'scrolly'

    //   bar.onMouseUp = () => delete bar.onMouseMove
    //   bar.onMouseDown = (b, pos) => {
    //     if (b !== 0) return
    //     bar.onMouseMove = dragMove(pos, {
    //       x: bar.point.x,
    //       y: bar.point.y,
    //       move: (x, y) => {
    //         // const per = { x, y }[xy] / (track[wh] - bar[wh])
    //         // this[scroll] = per * (content[wh] - area[wh])
    //         // adjustTracks()
    //       }
    //     })
    //   }
    // }

    // makeTrackDraggable('x')
    // makeTrackDraggable('y')

    // const adjustTracks = () => {
    //   // const ph = Math.min(1, perh)
    //   // const h = Math.max(3, Math.floor(trackv.h * ph))
    //   // const y = Math.floor((trackv.h - h) * (this.scrolly / (content.h - area.h)))
    //   // barv.visible = ph < 1
    //   // barv.point.y = y
    //   // barv.h = h

    //   // const pw = Math.min(1, perw)
    //   // const w = Math.max(3, Math.floor(trackh.w * pw))
    //   // const x = Math.floor((trackh.w - w) * (this.scrollx / (content.w - area.w)))
    //   // barh.visible = pw < 1
    //   // barh.point.x = x
    //   // barh.w = w
    // }

    // this.children = [make(panedxb, {
    //   children: [
    //     // make(panedyb, { children: [area, trackh] }),
    //     // make(panedyb, { children: [trackv, corner], size.w: trackv.size.w })
    //   ],
    // })]

    // const layout = this.layout = () => {
    //   vacuumFirstChild.apply(this)
    //   // content.point.x = -this.scrollx
    //   // content.point.y = -this.scrolly
    // }

    // const didScroll = this.didScroll = () => {
    //   const scrollx = Math.floor(Math.max(0, Math.min(content.size.w - area.size.w, this.scrollx)))
    //   const scrolly = Math.floor(Math.max(0, Math.min(content.size.h - area.size.h, this.scrolly)))
    //   if (scrollx !== this.scrollx) this.scrollx = scrollx
    //   if (scrolly !== this.scrolly) this.scrolly = scrolly
    //   adjustTracks()
    //   layout()
    //   this.panel?.needsRedraw()
    // }

    // this.onWheel = (px, py) => {
    //   px = px / 100 * this.scrollBy
    //   py = py / 100 * this.scrollBy
    //   if (this.panel?.isKeyDown('Shift')) [px, py] = [py, px]

    //   this.scrollx += px
    //   this.scrolly += py

    //   adjustTracks()
    // }

    // this.onResized = fixAll

    // function fixAll() {
    //   layout()
    //   didScroll()
    //   setTimeout(() => {
    //     perw = area.size.w / content.size.w
    //     perh = area.size.h / content.size.h
    //     adjustTracks()
    //   })
    // }

  }

  private didScroll() { }

  // override set(k: keyof this, newv: any): void {
  //   super.set(k, newv)
  //   if (k === 'scrollx' || k === 'scrolly') {
  //     this.didScroll()
  //   }
  // }

}
