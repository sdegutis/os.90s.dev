import type { DrawingContext } from "../core/drawing.js"
import { $ } from "../core/ref.js"
import { sys } from "../core/sys.js"
import { JsxAttrs } from "../jsx.js"
import { Scroll } from "./scroll.js"
import { View } from "./view.js"

export class TextBox extends View {

  constructor(config?: JsxAttrs<TextBox>) {
    super()
    this.canFocus = true
    this.canMouse = true
    this.setup(config)
  }

  override init(): void {
    super.init()

    this._cursor = new View({
      onMouseDown: (...args) => this.onMouseDown(...args),
      background: this.cursorColor,
      visible: false,
      size: {
        w: this.font.cw + this.xgap,
        h: this.font.ch + this.ygap,
      }
    })

    this.label = new View({
      canMouse: true,
      adjust: () => this.adjustTextLabel(),
      draw: (ctx) => this.drawTextLabel(ctx),
      onMouseDown: (...args) => this.onMouseDown(...args),
      children: [this._cursor]
    })

    this.children = [this.label]

    this.reflectCursorPos()
    this.adjustTextLabel()

    this.$cursorColor.watch(c => this._cursor.background = c)
  }

  $font = sys.$font
  get font() { return this.$font.val }
  set font(val) { this.$font.val = val }

  $color = $<number>(0xffffffff)
  get color() { return this.$color.val }
  set color(val) { this.$color.val = val }


  private label!: View
  private _cursor!: View

  private lines: string[] = ['']

  multiline = true
  onEnter?(): void

  get text() { return this.lines.join('\n') }
  set text(s: string) {
    this.lines = s.split('\n')
    this.highlight()
    this.row = Math.min(this.row, this.lines.length - 1)
    this.fixCol()
    this.adjustTextLabel()
  }

  highlightings: Record<string, [number, RegExp]> = {}

  $cursorColor = $(0x0000FF99)
  get cursorColor() { return this.$cursorColor.val }
  set cursorColor(val) { this.$cursorColor.val = val }

  private row = 0
  private col = 0
  private end = 0

  private colors: number[][] = []

  xgap = 0
  ygap = 0

  highlight() {
    this.colors.length = this.lines.length
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i]
      const cline = Array(line.length).fill(this.color)
      this.colors[i] = cline
      for (const [col, regex] of Object.values(this.highlightings)) {
        for (const m of line.matchAll(regex)) {
          cline.fill(col, m.index, m.index + m[1].length)
        }
      }
    }
  }

  override onMouseDown(button: number): void {
    this.focus()

    let x = this.mouse.x - this.label.point.x
    let y = this.mouse.y - this.label.point.y

    const row = Math.floor(y / (this.font.ch + this.ygap))
    const col = Math.floor(x / (this.font.cw + this.xgap))

    this.row = Math.min(row, this.lines.length - 1)
    this.end = this.col = col
    this.fixCol()
    this.restartBlinking()
    this.reflectCursorPos()
    this.scrollCursorIntoView()
    this.adjustTextLabel()
  }

  private drawTextLabel(ctx: DrawingContext) {
    for (let y = 0; y < this.lines.length; y++) {
      const line = this.lines[y]
      const py = y * this.font.ch + y * this.ygap + this.ygap / 2
      for (let x = 0; x < line.length; x++) {
        const px = x * this.font.cw + x * this.xgap
        this.font.print(ctx, px, py, this.colors[y][x], line[x])
      }
    }
  }

  private adjustTextLabel() {
    if (!this.label) { return }

    let cols = 0
    const rows = this.lines.length
    for (const line of this.lines) {
      if (line.length > cols) cols = line.length
    }
    cols++
    this.label.size = {
      w: (cols * this.font.cw) + (cols * this.xgap),
      h: (rows * this.font.ch) + (rows * this.ygap),
    }
    this.size = this.label.size
  }

  private reflectCursorPos() {
    this._cursor.point = {
      x: this.col * (this.font.cw + this.xgap),
      y: this.row * (this.font.ch + this.ygap),
    }
  }

  private findScrollAncestor() {
    let node = this.parent
    while (node) {
      if (node instanceof Scroll) return node
      node = node.parent
    }
    return node
  }

  private scrollCursorIntoView() {
    const scroll = this.findScrollAncestor()
    if (!scroll) return

    let cx = this._cursor.point.x
    let cy = this._cursor.point.y

    let node = this._cursor
    while (node.parent !== scroll) {
      node = node.parent!
      cx += node.point.x
      cy += node.point.y
    }

    if (cy < 0) {
      scroll.scrolly -= -cy
      this.adjustTextLabel()
    }

    if (cx < 0) {
      scroll.scrollx -= -cx
      this.adjustTextLabel()
    }

    const maxy = scroll.area.size.h - this._cursor.size.h
    if (cy > maxy) {
      scroll.scrolly -= maxy - cy
      this.adjustTextLabel()
    }

    const maxx = scroll.area.size.w - this._cursor.size.w
    if (cx > maxx) {
      scroll.scrollx -= maxx - cx
      this.adjustTextLabel()
    }
  }

  override onKeyDown(key: string): boolean {
    if (key === 'Home') {
      const firstNonSpace = this.lines[this.row].match(/[^\s]/)?.index ?? 0
      if (this.panel?.isKeyDown('Control')) {
        this.row = 0
        this.end = this.col = 0
      }
      else if (this.col !== firstNonSpace) {
        this.end = this.col = firstNonSpace
      }
      else {
        this.end = this.col = 0
      }
    }
    else if (key === 'End') {
      if (this.panel?.isKeyDown('Control')) {
        this.row = this.lines.length - 1
        this.col = this.end = this.lines[this.row].length
      }
      else {
        this.end = this.col = this.lines[this.row].length
      }
    }
    else if (key === 'ArrowRight') {
      if (this.col < this.lines[this.row].length) {
        this.end = this.col = this.col + 1
      }
      else if (this.row < this.lines.length - 1) {
        this.col = this.end = 0
        this.row++
      }
    }
    else if (key === 'ArrowLeft') {
      if (this.col > 0) {
        this.end = this.col = this.col - 1
      }
      else if (this.row > 0) {
        this.row--
        this.end = this.col = this.lines[this.row].length
      }
    }
    else if (key === 'ArrowDown') {
      this.row = Math.min(this.row + 1, this.lines.length - 1)
      this.fixCol()
    }
    else if (key === 'ArrowUp') {
      this.row = Math.max(0, this.row - 1)
      this.fixCol()
    }
    else if (key === 'Tab') {
      const [a, b] = this.halves()
      this.lines[this.row] = a + '  ' + b
      this.col += 2
      this.end = this.col
      this.adjustTextLabel()
    }
    else if (key === 'Backspace') {
      if (this.col > 0) {
        const [a, b] = this.halves()
        if (a === ' '.repeat(a.length) && a.length >= 2) {
          this.lines[this.row] = a.slice(0, -2) + b
          this.col -= 2
          this.end = this.col
          this.adjustTextLabel()
        }
        else {
          this.lines[this.row] = a.slice(0, -1) + b
          this.col--
          this.end = this.col
          this.adjustTextLabel()
        }
      }
      else if (this.row > 0) {
        this.end = this.lines[this.row - 1].length
        this.lines[this.row - 1] += this.lines[this.row]
        this.lines.splice(this.row, 1)
        this.row--
        this.col = this.end
        this.adjustTextLabel()
      }
    }
    else if (key === 'Delete') {
      if (this.col < this.lines[this.row].length) {
        const [a, b] = this.halves()
        this.lines[this.row] = a + b.slice(1)
        this.adjustTextLabel()
      }
      else if (this.row < this.lines.length - 1) {
        this.lines[this.row] += this.lines[this.row + 1]
        this.lines.splice(this.row + 1, 1)
        this.adjustTextLabel()
      }
    }
    else if (key === 'Enter') {
      if (this.multiline) {
        const [a, b] = this.halves()
        this.lines[this.row] = a
        this.lines.splice(++this.row, 0, b)
        this.end = this.col = 0
        this.adjustTextLabel()
      }
      else {
        this.onEnter?.()
      }
    }
    else if (key.length === 1 && !this.panel?.isKeyDown('Control') && !this.panel?.isKeyDown('Alt')) {
      const [a, b] = this.halves()
      this.lines[this.row] = a + key + b
      this.col++
      this.end = this.col
      this.adjustTextLabel()
    }
    else {
      return false
    }

    this.highlight()
    this.restartBlinking()
    this.reflectCursorPos()
    this.scrollCursorIntoView()
    return true
  }

  private halves() {
    let line = this.lines[this.row]
    const first = line.slice(0, this.col)
    const last = line.slice(this.col)
    return [first, last] as const
  }

  private fixCol() {
    this.col = Math.min(this.lines[this.row].length, this.end)
  }

  private blink?: number

  private restartBlinking() {
    this.stopBlinking()
    this._cursor.visible = true
    this.blink = setInterval(() => {
      this._cursor.visible = !this._cursor.visible
      this.panel?.needsRedraw()
    }, 500)
  }

  private stopBlinking() {
    this._cursor.visible = false
    clearInterval(this.blink)
  }

  override onFocus(): void {
    this.restartBlinking()
  }

  override onBlur(): void {
    this.stopBlinking()
  }

}
