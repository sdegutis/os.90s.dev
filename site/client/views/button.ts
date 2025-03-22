import { border } from "./border.js"

export class button extends border {

  override hoverBackground: number = 0xffffff22
  override pressBackground: number = 0xffffff11
  override selectedBackground: number = 0xffffff33

  override passthrough = false

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

}
