import type { DrawingContext } from "../core/drawing.js"
import { JsxAttrs } from "../core/jsx.js"
import { $, makeRef } from "../core/ref.js"
import { View } from "./view.js"

export class Margin extends View {

  constructor(config?: JsxAttrs<Margin>) {
    super()
    this.setup(config)
  }

  override init(): void {
    super.init()

    this.$paddingColor.watch(() => this.needsRedraw())

    this.$left.watch(() => this.layout())
    this.$right.watch(() => this.layout())
    this.$down.watch(() => this.layout())
    this.$up.watch(() => this.layout())

    this.$padding?.watch(n => {
      this.up = n
      this.down = n
      this.left = n
      this.right = n
    })

    this.layout()
  }

  $padding = $(0)

  get padding() { return this.$padding.val }
  set padding(ns: number | [number, number] | [number, number, number] | [number, number, number, number]) {
    const [u, r, d, l] =
      typeof ns === 'number' ? [ns, ns, ns, ns] :
        ns.length === 2 ? [...ns, ...ns] :
          ns.length === 3 ? [...ns, ns[1]] :
            ns

    this.$padding.val = u
    this.up = u
    this.down = d
    this.left = l
    this.right = r
  }

  paddingColor = 0x00000000
  readonly $paddingColor = makeRef(this, 'paddingColor')

  up = 0; readonly $up = makeRef(this, 'up')
  down = 0; readonly $down = makeRef(this, 'down')
  left = 0; readonly $left = makeRef(this, 'left')
  right = 0; readonly $right = makeRef(this, 'right')

  override layout(): void {
    if (this.size.w === 0 || this.size.h === 0) return

    const c = this.firstChild
    if (c) {
      c.point = {
        x: this.left,
        y: this.up,
      }
      c.size = {
        w: this.size.w - (this.left + this.right),
        h: this.size.h - (this.up + this.down),
      }
    }
  }

  override draw(ctx: DrawingContext): void {
    super.draw(ctx)
    this.drawBorder(ctx, this.paddingColor)
  }

  protected drawBorder(ctx: DrawingContext, col: number) {
    if (this.left) { ctx.fillRect(0, this.up, this.left, this.size.h - this.up - this.down, col) }
    if (this.right) { ctx.fillRect(this.size.w - this.right, this.up, this.right, this.size.h - this.up - this.down, col) }
    if (this.up) { ctx.fillRect(this.left, 0, this.size.w - this.left - this.right, this.up, col,) }
    if (this.down) { ctx.fillRect(this.left, this.size.h - this.down, this.size.w - this.left - this.right, this.down, col,) }
    if (this.left && this.up) { ctx.fillRect(0, 0, this.left, this.up, col) }
    if (this.right && this.up) { ctx.fillRect(this.size.w - this.right, 0, this.right, this.up, col) }
    if (this.left && this.down) { ctx.fillRect(0, this.size.h - this.down, this.left, this.down, col) }
    if (this.right && this.down) { ctx.fillRect(this.size.w - this.right, this.size.h - this.down, this.right, this.down, col) }
  }

}
