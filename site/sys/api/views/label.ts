import type { DrawingContext } from "../core/drawing.js"
import { $$ } from "../core/ref.js"
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

  color = 0xffffffff
  $color = $$(this, 'color')

  font = sys.$font.val
  $font = $$(this, 'font')

  text = ''
  $text = $$(this, 'text')

  override adjust() {
    this.size = this.font.calcSize(this.text)
  }

  override draw(ctx: DrawingContext): void {
    super.draw(ctx)
    this.font.print(ctx, 0, 0, this.color, this.text)
  }

}
