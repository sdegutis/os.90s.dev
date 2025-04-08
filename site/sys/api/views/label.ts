import type { DrawingContext } from "../core/drawing.js"
import { $ } from "../core/ref.js"
import { sys } from "../core/sys.js"
import { JsxAttrs } from "../jsx.js"
import { View } from "./view.js"

export class Label extends View {

  constructor(config?: JsxAttrs<Label>) {
    super()
    this.setup(config)
  }

  override init(): void {
    super.init()

    this.$text.watch(() => { this.adjust(); this.needsRedraw() })
    this.$font.watch(() => { this.adjust(); this.needsRedraw() })
    this.$color.watch(() => this.needsRedraw())
    this.adjust()
  }

  $color = $<number>(0xffffffff)
  get color() { return this.$color.val }
  set color(val) { this.$color.val = val }

  $font = sys.$font
  get font() { return this.$font.val }
  set font(val) { this.$font.val = val }

  $text = $<string>('')
  get text() { return this.$text.val }
  set text(val) { this.$text.val = val }

  override adjust() {
    this.size = this.font.calcSize(this.text)
  }

  override draw(ctx: DrawingContext): void {
    super.draw(ctx)
    this.font.print(ctx, 0, 0, this.color, this.text)
  }

}
