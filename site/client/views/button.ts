import { border } from "./border.js"
import { colorFor } from "./view.js"

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

  override redrawKeys = [...(this as border).redrawKeys,
    'pressed', 'hovered', 'selected',
    'hoverBackground', 'pressBackground', 'selectedBackground',
    'hoverBorderColor', 'pressBorderColor', 'selectedBorderColor',
  ]

  readonly pressed: boolean = false
  readonly selected: boolean = false

  readonly hoverBackground: number = 0xffffff22
  readonly pressBackground: number = 0xffffff11
  readonly selectedBackground: number = 0xffffff33

  readonly hoverBorderColor: number = 0x00000000
  readonly pressBorderColor: number = 0x00000000
  readonly selectedBorderColor: number = 0x00000000

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
    this.mutate(v => v.pressed = true)
    this.counter.increase()

    this.onMouseUp = () => {
      if (this.pressed) {
        this.onClick?.({ button, count: this.counter.count })
        this.mutate(v => v.pressed = false)
      }
    }
  }

  override onMouseExit(): void {
    this.mutate(v => v.pressed = false)
  }

}
