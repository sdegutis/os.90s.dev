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

    const bg = this.background
    const bd = this.borderColor

    if (this.selected) {
      (this as any).background = this.selectedBackground;
      (this as any).borderColor = this.selectedBorderColor
    }
    else if (this.pressed) {
      (this as any).background = this.pressBackground;
      (this as any).borderColor = this.pressBorderColor
    }
    else if (this.hovered) {
      (this as any).background = this.hoverBackground;
      (this as any).borderColor = this.hoverBorderColor
    }
    else {
      (this as any).background = '#00000000';
      (this as any).borderColor = '#00000000'
    }

    super.draw(ctx, px, py);

    (this as any).background = bg;
    (this as any).borderColor = bd

  }

  private b: number | undefined

  override onMouseExit(): void {
    this.$update('pressed', false)
  }

  override onMouseUp(): void {
    if (this.pressed) {
      this.onClick?.({ button: this.b!, count: this.counter.count })
      this.$update('pressed', false)
    }
  }

  override onMouseDown(button: number): void {
    this.b = button
    this.$update('pressed', true)
    this.counter.increase()
  }

}
