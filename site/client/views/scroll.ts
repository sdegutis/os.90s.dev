import { make, view } from "./view.js"

export class scroll extends view {

  readonly scrollx: number = 0
  readonly scrolly: number = 0
  readonly amount: number = 6

  readonly trackx = make(view, { w: 3, background: 0xffffff22, onMouseDown: () => this.dragTrack(this.trackx) })
  readonly tracky = make(view, { h: 3, background: 0xffffff22, onMouseDown: () => this.dragTrack(this.tracky) })

  readonly barx = make(view, { w: 3, background: 0x00000099, children: [this.trackx] })
  readonly bary = make(view, { h: 3, background: 0x00000099, children: [this.tracky] })

  readonly scrollVisibleClaims = 0
  private cancelTracker?: () => void
  private cancelClaim?: ReturnType<typeof setTimeout>

  override init(): void {
    this.addLayoutKeys('scrollx', 'scrolly')

    const mthis = this.mutable()
    mthis.children = [...this.children, this.barx, this.bary]
    mthis.commit()

    this.barx.onMouseEnter = () => this.mutate(v => v.scrollVisibleClaims++)
    this.bary.onMouseEnter = () => this.mutate(v => v.scrollVisibleClaims++)
    this.barx.onMouseExit = () => this.mutate(v => v.scrollVisibleClaims--)
    this.bary.onMouseExit = () => this.mutate(v => v.scrollVisibleClaims--)

    // this.$watch('scrollVisibleClaims', (claims) => {
    //   this.barx.visible = (claims > 0) && (this.firstChild!.h > this.h)
    //   this.bary.visible = (claims > 0) && (this.firstChild!.w > this.w)
    // })

    // this.$watch('scrollx', () => this.adjustTracks())
    // this.$watch('scrolly', () => this.adjustTracks())
    // this.$watch('scrollx', () => this.layout())
    // this.$watch('scrolly', () => this.layout())
  }

  override onResized(): void {
    this.adjustTracks()
  }

  override onChildResized(): void {
    this.adjust?.()
    this.layout()
  }

  private adjustTracks() {
    const contentView = this.firstChild!

    const trackx = this.trackx.mutable()
    const tracky = this.tracky.mutable()

    const py = Math.min(1, this.h / contentView.h)
    trackx.y = Math.round(this.scrolly / (contentView.h - this.h) * this.barx.h * (1 - py))
    trackx.h = Math.round(this.barx.h * py)

    const px = Math.min(1, this.w / contentView.w)
    tracky.x = Math.round(this.scrollx / (contentView.w - this.w) * this.bary.w * (1 - px))
    tracky.w = Math.round(this.bary.w * px)

    trackx.commit()
    tracky.commit()
  }

  private dragTrack(track: view) {
    this.mutate(v => v.scrollVisibleClaims++)

    // const o = { y: this.trackx.y, x: this.tracky.x }
    // const drag = dragMove(o)
    // const move = () => {
    //   drag()

    //   if (track === this.trackx) this.scrolly = Math.round((o.y / (this.barx.h - this.trackx.h)) * this.firstChild!.h)
    //   if (track === this.tracky) this.scrollx = Math.round((o.x / (this.bary.w - this.tracky.w)) * this.firstChild!.w)
    // }
    // const up = () => {
    //   setTimeout(() => { this.scrollVisibleClaims-- }, 500)
    // }
    // sys.trackMouse({ move, up })
  }

  override onMouseEnter(): void {
    // this.cancelTracker = sys.trackMouse({
    //   autostop: false,
    //   move: () => {
    //     if (this.cancelClaim) clearTimeout(this.cancelClaim)
    //     else this.scrollVisibleClaims++
    //     setTimeout(() => { this.scrollVisibleClaims-- }, 500)
    //   }
    // })
  }

  override onMouseExit(): void {
    this.cancelTracker?.()
    delete this.cancelTracker
  }

  override layout(): void {
    if (!this.firstChild) return

    const firstChild = this.firstChild.mutable()
    const barx = this.barx.mutable()
    const bary = this.bary.mutable()
    const trackx = this.trackx.mutable()
    const tracky = this.tracky.mutable()

    this.fixScrollPos()
    firstChild.x = -this.scrollx
    firstChild.y = -this.scrolly

    barx.x = this.w - barx.w
    barx.y = 0
    barx.h = this.h - bary.h

    bary.y = this.h - bary.h
    bary.x = 0
    bary.w = this.w - barx.w

    trackx.x = 0
    trackx.w = barx.w

    tracky.y = 0
    tracky.h = bary.h

    firstChild.commit()
    barx.commit()
    bary.commit()
    trackx.commit()
    tracky.commit()

    this.adjustTracks()
  }

  override onWheel(x: number, y: number): void {
    const mthis = this.mutable()

    mthis.scrollVisibleClaims++
    setTimeout(() => this.mutate(v => v.scrollVisibleClaims--), 500)

    const sy = this.panel!.keymap['Shift'] ? 'scrollx' : 'scrolly'
    mthis[sy] += y / 100 * this.amount

    mthis.commit()
  }

  private fixScrollPos() {
    if (!this.firstChild) return

    const mthis = this.mutable()

    mthis.scrollx = Math.max(0, Math.min(this.firstChild.w - this.w, this.scrollx))
    mthis.scrolly = Math.max(0, Math.min(this.firstChild.h - this.h, this.scrolly))

    mthis.commit()
  }






  // readonly borderColor: number = 0x00000000
  // readonly padding: number = 0

  // override passthrough: boolean = true

  // override init(): void {
  //   this.addAdjustKeys('padding')
  //   this.addRedrawKeys('borderColor')
  // }

  // override adjust(): void {
  //   const mutthis = this.mutable()
  //   mutthis.w = this.padding + (this.firstChild?.w ?? 0) + this.padding
  //   mutthis.h = this.padding + (this.firstChild?.h ?? 0) + this.padding
  //   mutthis.commit()
  // }

  // override layout(): void {
  //   this.firstChild?.mutate(c => {
  //     c.x = this.padding
  //     c.y = this.padding
  //   })
  // }

  // override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
  //   super.draw(ctx, px, py)
  //   this.drawBorder(ctx, px, py, colorFor(this.borderColor))
  // }

  // protected drawBorder(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number, col: string) {
  //   ctx.strokeStyle = col
  //   for (let i = 0; i < this.padding; i++) {
  //     ctx.strokeRect(
  //       px + i + .5,
  //       py + i + .5,
  //       this.w - i * 2 - 1,
  //       this.h - i * 2 - 1,
  //     )
  //   }
  // }

}
