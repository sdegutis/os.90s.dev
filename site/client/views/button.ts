import { Border } from "./border.js"

export class Button extends Border {

  override hoverBackground: number = 0xffffff22
  override pressBackground: number = 0xffffff11
  override selectedBackground: number = 0xffffff33

  override canMouse = true

  onClick?(button: number): void

  override init(): void {
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

}
