import { panedxb, panedyb } from "./paned.js"
import { make, view } from "./view.js"

export class scroll extends view {

  readonly scrollx: number = 0
  readonly scrolly: number = 0
  readonly amount: number = 6

  readonly content!: view

  override init(): void {

    this.addLayoutKeys('scrollx', 'scrolly')

    this.set('content', this.children[0])

    function bubble(this: view) {
      this.adjust?.()
      this.parent?.onChildResized()
    }

    const trackv = make(view, { w: 3, background: 0x330000ff })
    const trackh = make(view, { h: 3, background: 0x003300ff })
    const corner = make(view, { h: 3, background: 0x333300ff })
    const area = make(view, { background: 0x000033ff, onChildResized: bubble, children: [this.content] })

    this.set('children',
      [make(panedxb, {
        onChildResized: bubble,
        children: [
          make(panedyb, { children: [area, trackh], onChildResized: bubble }),
          make(panedyb, { children: [trackv, corner], w: trackv.w })
        ],
      })]
    )

  }

  override onChildResized(): void {
    console.log('view res')
  }

  override layout(): void {
    if (!this.content) return

    this.firstChild?.mutate(v => {
      v.x = 0
      v.y = 0
      v.w = this.w
      v.h = this.h
    })

    this.set('scrollx', Math.max(0, Math.min(this.content.w - this.w, this.scrollx)))
    this.set('scrolly', Math.max(0, Math.min(this.content.h - this.h, this.scrolly)))

    this.content.set('x', -this.scrollx)
    this.content.set('y', -this.scrolly)


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

  override onWheel(x: number, y: number): void {
    const sy = this.panel!.keymap['Shift'] ? 'scrollx' : 'scrolly'
    this.set(sy, this[sy] + y / 100 * this.amount)
  }

}
