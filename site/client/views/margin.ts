import type { DrawingContext } from "../core/drawing.js"
import { $, Ref } from "../core/ref.js"
import { JsxAttrs } from "../jsx.js"
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

  $padding?: Ref<number>

  set padding(ns: number | [number, number] | [number, number, number] | [number, number, number, number]) {
    const [u, r, d, l] =
      typeof ns === 'number' ? [ns, ns, ns, ns] :
        ns.length === 2 ? [...ns, ...ns] :
          ns.length === 3 ? [...ns, ns[1]] :
            ns

    this.up = u
    this.down = d
    this.left = l
    this.right = r
  }

  $paddingColor = $<number>(0x00000000)
  get paddingColor() { return this.$paddingColor.val }
  set paddingColor(val) { this.$paddingColor.val = val }

  $up = $<number>(0)
  get up() { return this.$up.val }
  set up(val) { this.$up.val = val }

  $down = $<number>(0)
  get down() { return this.$down.val }
  set down(val) { this.$down.val = val }

  $left = $<number>(0)
  get left() { return this.$left.val }
  set left(val) { this.$left.val = val }

  $right = $<number>(0)
  get right() { return this.$right.val }
  set right(val) { this.$right.val = val }

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

  override draw(ctx: DrawingContext, px: number, py: number): void {
    super.draw(ctx, px, py)
    this.drawBorder(ctx, px, py, this.paddingColor)
  }

  protected drawBorder(ctx: DrawingContext, px: number, py: number, col: number) {
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
