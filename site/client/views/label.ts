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
    this.$textColor.watch(() => this.needsRedraw())
    this.adjust()
  }

  $textColor = $<number>(0xffffffff)
  get textColor() { return this.$textColor.val }
  set textColor(val) { this.$textColor.val = val }

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
    this.font.print(ctx, 0, 0, this.textColor, this.text)
  }

}
