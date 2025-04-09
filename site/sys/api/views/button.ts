import type { DrawingContext } from "../core/drawing.js"
import { makeRef } from "../core/ref.js"
import { JsxAttrs } from "../jsx.js"
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
  $hoverBackground = makeRef(this, 'hoverBackground')

  pressBackground = 0xffffff11
  $pressBackground = makeRef(this, 'pressBackground')

  selectedBackground = 0xffffff33
  $selectedBackground = makeRef(this, 'selectedBackground')

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

    if (this.selected) {
      this.drawBackground(ctx, this.selectedBackground)
    }
    else if (this.pressed) {
      this.drawBackground(ctx, this.pressBackground)
    }
    else if (this.hovered) {
      this.drawBackground(ctx, this.hoverBackground)
    }
  }

}
