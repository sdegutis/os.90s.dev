import type { DrawingContext } from "../core/drawing.js"
import { JsxAttrs } from "../core/jsx.js"
import { makeRef } from "../core/ref.js"
import { Border } from "./border.js"

export class Button extends Border {

  constructor(config?: JsxAttrs<Button>) {
    super()
    this.canMouse = true
    this.setup(config)
  }

  override init(): void {
    super.init()
    this.$hoverBackground.watch(() => this.needsRedraw())
    this.$selectedBackground.watch(() => this.needsRedraw())
    this.$pressBackground.watch(() => this.needsRedraw())
    this.adjust()
  }

  hoverBackground = 0xffffff22
  readonly $hoverBackground = makeRef(this, 'hoverBackground')

  pressBackground = 0xffffff11
  readonly $pressBackground = makeRef(this, 'pressBackground')

  selectedBackground = 0xffffff33
  readonly $selectedBackground = makeRef(this, 'selectedBackground')

  onClick?(button: number): void

  override onMouseDown(button: number): void {
    this.onMouseUp = () => {
      if (this.pressed) {
        this.onClick?.(button)
      }
    }
  }

  override onMouseExit(): void {
    this.pressed = false
  }

  override draw(ctx: DrawingContext): void {
    super.draw(ctx)

    if (this.pressed) {
      this.drawBackground(ctx, this.pressBackground)
    }
    else if (this.selected) {
      this.drawBackground(ctx, this.selectedBackground)
    }
    else if (this.hovered) {
      this.drawBackground(ctx, this.hoverBackground)
    }
  }

}
