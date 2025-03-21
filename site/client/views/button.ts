import { colorFor } from "../util/colors.js"
import { border } from "./border.js"

export class ClickCounter {

  count = 0
  private clear!: ReturnType<typeof setTimeout>
  private sec: number

  constructor(sec = 333) {
    this.sec = sec
  }

  increase() {
    this.count++
    clearTimeout(this.clear)
    this.clear = setTimeout(() => this.count = 0, this.sec)
  }

}

export class button extends border {

  override init(): void {
    // this.addRedrawKeys(
    //   'pressed', 'hovered', 'selected',
    //   'hoverBackground', 'pressBackground', 'selectedBackground',
    //   'hoverBorderColor', 'pressBorderColor', 'selectedBorderColor',
    // )
  }

  pressed: boolean = false
  selected: boolean = false

  hoverBackground: number = 0xffffff22
  pressBackground: number = 0xffffff11
  selectedBackground: number = 0xffffff33

  hoverBorderColor: number = 0x00000000
  pressBorderColor: number = 0x00000000
  selectedBorderColor: number = 0x00000000

  private counter = new ClickCounter()

  override passthrough = false

  onClick?(click: { button: number, count: number }): void

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    super.draw(ctx, px, py)

    if (this.selected) {
      this.drawBackground(ctx, px, py, colorFor(this.selectedBackground))
      this.drawBorder(ctx, px, py, colorFor(this.selectedBorderColor))
    }
    else if (this.pressed) {
      this.drawBackground(ctx, px, py, colorFor(this.pressBackground))
      this.drawBorder(ctx, px, py, colorFor(this.pressBorderColor))
    }
    else if (this.hovered) {
      this.drawBackground(ctx, px, py, colorFor(this.hoverBackground))
      this.drawBorder(ctx, px, py, colorFor(this.hoverBorderColor))
    }
  }

  override onMouseDown(button: number): void {
    this.pressed = true
    this.counter.increase()

    this.onMouseUp = () => {
      if (this.pressed) {
        this.onClick?.({ button, count: this.counter.count })
        this.pressed = false
      }
    }
  }

  override onMouseExit(): void {
    this.pressed = false
  }

}
