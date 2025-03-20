import { crt2025, Font } from "../../shared/font.js"
import { colorFor } from "../util/colors.js"
import { vacuumFirstChild } from "../util/layout.js"
import { scroll } from "./scroll.js"
import { make, view } from "./view.js"

export class textarea extends view {

  readonly font: Font = crt2025
  readonly color: number = 0xffffffff

  private scroll!: scroll
  private label!: view
  private _cursor!: view

  override canFocus: boolean = true

  _text = ''
  private lines: string[] = [this._text]

  get text() { return this._text }
  set text(s: string) {
    this._text = s
    this.lines = s.split('\n')
    this.highlight()
    this.row = Math.min(this.row, this.lines.length - 1)
    this.fixCol()
    this.adjustTextLabel()
  }

  highlightings: Record<string, [number, RegExp]> = {}

  readonly cursorColor = 0x0000FF99

  private row = 0
  private col = 0
  private end = 0

  override layout = vacuumFirstChild

  private colors: number[][] = []

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

  override init(): void {
    this._cursor = make(view, {
      onMouseDown: () => this.onMouseDown(),
      background: this.cursorColor,
      visible: false,
      w: this.font.cw + this.font.xgap,
      h: this.font.ch + this.font.ygap,
    })

    this.label = make(view, {
      adjust: () => this.adjustTextLabel(),
      draw: (ctx, px, py) => {
        ctx.fillStyle = colorFor(0x99000099)
        ctx.fillRect(px, py, this.label.w, this.label.h)
        this.drawTextLabel(ctx, px, py)
      },
      onMouseDown: () => this.onMouseDown(),
      children: [this._cursor]
    })

    this.scroll = make(scroll, {
      onMouseDown: (...args) => this.onMouseDown(),
      children: [this.label]
    })

    this.set('children', [this.scroll])

    this.reflectCursorPos()
    this.adjustTextLabel()
  }

  override set(k: keyof this, v: any): void {
    super.set(k, v)
    if (k === 'cursorColor') {
      this._cursor.set('background', v)
    }
  }

  override onMouseDown(): void {
    this.focus()

    let x = this.mouse.x - this.label.x
    let y = this.mouse.y - this.label.y

    const row = Math.floor(y / (this.font.ch + this.font.ygap))
    const col = Math.floor(x / (this.font.cw + this.font.xgap))

    this.row = Math.min(row, this.lines.length - 1)
    this.end = this.col = col
    this.fixCol()
    this.restartBlinking()
    this.reflectCursorPos()
    this.scrollCursorIntoView()
    this.adjustTextLabel()
  }

  private drawTextLabel(ctx: OffscreenCanvasRenderingContext2D, panx: number, pany: number) {
    for (let y = 0; y < this.lines.length; y++) {
      const line = this.lines[y]
      const py = y * this.font.ch + y * this.font.ygap
      for (let x = 0; x < line.length; x++) {
        const px = x * this.font.cw + x * this.font.xgap
        this.font.print(ctx, panx + px, pany + py, this.colors[y][x], line[x])
      }
    }
  }

  private adjustTextLabel() {
    if (!this.label) { return }

    let w = 0
    for (const line of this.lines) {
      if (line.length > w) w = line.length
    }
    this.label.mutate(label => {
      label.w = w * this.font.cw + (w - 1) * this.font.xgap
      label.h = (this.lines.length * this.font.ch) + ((this.lines.length - 1) * this.font.ygap)
      label.w += this.font.cw + this.font.xgap
    })
  }

  private reflectCursorPos() {
    this._cursor.set('x', (this.col * this.font.xgap + this.col * this.font.cw) - Math.floor(this.font.xgap / 2))
    this._cursor.set('y', (this.row * this.font.ygap + this.row * this.font.ch) - Math.floor(this.font.ygap / 2))
  }

  private scrollCursorIntoView() {
    let x = this._cursor.x
    let y = this._cursor.y

    let node = this._cursor
    while (node !== this.scroll) {
      node = node.parent!
      x += node.x
      y += node.y
    }

    if (y < 0) {
      this.scroll.mutate(v => v.scrolly -= -y)
      this.adjustTextLabel()
    }

    if (x < 0) {
      this.scroll.mutate(v => v.scrollx -= -x)
      this.adjustTextLabel()
    }

    const maxy = this.scroll.h - this._cursor.h
    if (y > maxy) {
      this.scroll.mutate(v => v.scrolly -= maxy - y)
      this.adjustTextLabel()
    }

    const maxx = this.scroll.w - this._cursor.w
    if (x > maxx) {
      this.scroll.mutate(v => v.scrollx -= maxx - x)
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
      const [a, b] = this.halves()
      this.lines[this.row] = a
      this.lines.splice(++this.row, 0, b)
      this.end = this.col = 0
      this.adjustTextLabel()
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

  private blink?: ReturnType<typeof setInterval>

  private restartBlinking() {
    this.stopBlinking()
    this._cursor.set('visible', true)
    this.blink = setInterval(() => {
      this._cursor.set('visible', !this._cursor.visible)
      this.panel?.needsRedraw()
    }, 500)
  }

  private stopBlinking() {
    this._cursor.set('visible', false)
    clearInterval(this.blink)
  }

  override onFocus(): void {
    this.restartBlinking()
  }

  override onBlur(): void {
    this.stopBlinking()
  }

}
