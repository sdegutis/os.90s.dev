import type { DrawingContext } from "../core/drawing.js"
import { JsxAttrs } from "../core/jsx.js"
import { makeRef } from "../core/ref.js"
import { sys } from "../core/sys.js"
import { View } from "./view.js"

export class Label extends View {

  constructor(config?: JsxAttrs<Label>) {
    super()
    this.$font = sys.$font
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
  readonly $color = makeRef(this, 'color')

  font = sys.$font.$
  readonly $font = makeRef(this, 'font')

  text = ''
  readonly $text = makeRef(this, 'text')

  override adjust() {
    this.size = this.font.calcSize(this.text)
  }

  override draw(ctx: DrawingContext): void {
    super.draw(ctx)
    this.font.print(ctx, 0, 0, this.color, this.text)
  }

}
