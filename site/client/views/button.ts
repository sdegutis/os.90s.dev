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

  override redrawKeys = [...(this as border).redrawKeys,
    'pressed', 'hovered', 'selected',
    'hoverBackground', 'pressBackground', 'selectedBackground',
    'hoverBorderColor', 'pressBorderColor', 'selectedBorderColor',
  ]

  readonly pressed: boolean = false
  readonly selected: boolean = false

  readonly hoverBackground: string = '#ffffff22'
  readonly pressBackground: string = '#ffffff11'
  readonly selectedBackground: string = '#ffffff33'

  readonly hoverBorderColor: string = '#00000000'
  readonly pressBorderColor: string = '#00000000'
  readonly selectedBorderColor: string = '#00000000'

  private counter = new ClickCounter()

  override passthrough = false

  onClick?(click: { button: number, count: number }): void

  override draw(ctx: OffscreenCanvasRenderingContext2D, px: number, py: number): void {
    super.draw(ctx, px, py)

    if (this.selected) {
      ctx.fillStyle = this.selectedBackground
      ctx.fillRect(px, py, this.w, this.h)

      ctx.strokeStyle = this.selectedBorderColor
      this.drawBorder(ctx, px, py)
    }
    else if (this.pressed) {
      ctx.fillStyle = this.pressBackground
      ctx.fillRect(px, py, this.w, this.h)

      ctx.strokeStyle = this.pressBorderColor
      this.drawBorder(ctx, px, py)
    }
    else if (this.hovered) {
      ctx.fillStyle = this.hoverBackground
      ctx.fillRect(px, py, this.w, this.h)

      ctx.strokeStyle = this.hoverBorderColor
      this.drawBorder(ctx, px, py)
    }
  }

  override onMouseDown(button: number): void {
    this.$update('pressed', true)
    this.counter.increase()

    this.onMouseUp = () => {
      if (this.pressed) {
        this.onClick?.({ button, count: this.counter.count })
        this.$update('pressed', false)
      }
    }
  }

  override onMouseExit(): void {
    this.$update('pressed', false)
  }

}
