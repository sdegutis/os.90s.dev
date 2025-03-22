import { Border } from "./border.js"

export class Button extends Border {

  override hoverBackground: number = 0xffffff22
  override pressBackground: number = 0xffffff11
  override selectedBackground: number = 0xffffff33

  override init(): void {
    this.$multiplex(
      'state', 'hoverBackground', 'pressBackground', 'selectedBackground',
    ).watch(() => this.needsRedraw())
  }

  override passthrough = false

  onClick?(button: number): void

  override onMouseDown(button: number): void {
    this.pressed = true

    this.onMouseUp = () => {
      if (this.pressed) {
        this.onClick?.(button)
        this.pressed = false
      }
    }
  }

  override onMouseExit(): void {
    this.pressed = false
  }

}
