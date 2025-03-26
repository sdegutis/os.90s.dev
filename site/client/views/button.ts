import { Border } from "./border.js"

export class Button extends Border {

  hoverBackground: number = 0xffffff22
  pressBackground: number = 0xffffff11
  selectedBackground: number = 0xffffff33

  override canMouse = true

  onClick?(button: number): void

  override init(): void {
    this.$.hoverBackground.watch(() => this.needsRedraw())
    this.$.selectedBackground.watch(() => this.needsRedraw())
    this.$.pressBackground.watch(() => this.needsRedraw())
    this.adjust()
  }

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

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
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
