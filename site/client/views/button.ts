import type { DrawingContext } from "../core/drawing.js"
import { $ } from "../core/ref.js"
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

  $hoverBackground = $<number>(0xffffff22)
  get hoverBackground() { return this.$hoverBackground.val }
  set hoverBackground(val) { this.$hoverBackground.val = val }

  $pressBackground = $<number>(0xffffff11)
  get pressBackground() { return this.$pressBackground.val }
  set pressBackground(val) { this.$pressBackground.val = val }

  $selectedBackground = $<number>(0xffffff33)
  get selectedBackground() { return this.$selectedBackground.val }
  set selectedBackground(val) { this.$selectedBackground.val = val }

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

  override draw(ctx: DrawingContext, px: number, py: number): void {
    super.draw(ctx, px, py)

    if (this.selected) {
      this.drawBackground(ctx, px, py, this.selectedBackground)
    }
    else if (this.pressed) {
      this.drawBackground(ctx, px, py, this.pressBackground)
    }
    else if (this.hovered) {
      this.drawBackground(ctx, px, py, this.hoverBackground)
    }
  }

}
