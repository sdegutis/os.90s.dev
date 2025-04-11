import { DrawingContext } from "../core/drawing.js"
import { Listener } from "../core/listener.js"
import { $, makeRef, multiplex } from "../core/ref.js"
import { sys } from "../core/sys.js"
import { Point } from "../core/types.js"
import { JsxAttrs } from "../jsx.js"
import { TextModel } from "./textmodel.js"
import { View } from "./view.js"

export class TextBox extends View {

  constructor(config?: JsxAttrs<TextBox>) {
    super()
    this.$font = sys.$font
    this.canFocus = true
    this.canMouse = true
    this.setup(config)
  }

  override init(): void {
    super.init()

    this.$font.watch(m => this.adjust())

    this.makeCursors()
    this.model.onCursorsChanged.watch(() => {
      this.makeCursors()
    })

    this.adjust()
    this.model.onLineChanged.watch(() => this.adjust())
  }

  model = new TextModel()

  font = sys.$font.val
  $font = makeRef(this, 'font')

  cursorColor = 0x0000ff99
  $cursorColor = makeRef(this, 'cursorColor')

  textColor = 0xffffffff
  $textColor = makeRef(this, 'textColor')

  xgap = 0
  ygap = 0

  onEnter?(): void

  private makeCursors() {
    this.children = this.model.cursors.map(c => {

      const view = new View({
        visible: this.$focused,
        background: this.$cursorColor,
        point: multiplex([c.$row, c.$col], () => ({
          x: c.col * (this.font.cw + this.xgap),
          y: c.row * (this.font.ch + this.ygap),
        })),
        size: this.$font.adapt(font => ({
          w: font.cw + this.xgap,
          h: font.ch + this.ygap,
        })),
      })

      let blinker: number | undefined
      const blink = () => view.alpha = 1 - view.alpha

      this.restartCursorBlink.watch(() => {
        clearInterval(blinker)
        blinker = setInterval(blink, 500)
        view.alpha = 1
      })

      this.$visible.watch(is => {
        if (!is) clearInterval(blinker)
      })

      return view

    })
  }

  private restartCursorBlink = new Listener()

  override onMouseDown(button: number): void {

  }

  override onMouseMove(pos: Point): void {

  }

  // get text() { return this.lines.join('\n') }
  // set text(s: string) {
  //   this.lines = s.split('\n')
  //   this.highlight()
  //   this.row = Math.min(this.row, this.lines.length - 1)
  //   this.fixCol()
  //   this.adjust()
  // }

  // highlight() {
  //   this.colors.length = this.lines.length
  //   for (let i = 0; i < this.lines.length; i++) {
  //     const line = this.lines[i]
  //     const cline = Array(line.length).fill(0xffffffff)
  //     this.colors[i] = cline
  //     for (const [col, regex] of Object.values(this.highlightings)) {
  //       for (const m of line.matchAll(regex)) {
  //         cline.fill(col, m.index, m.index + m[1].length)
  //       }
  //     }
  //   }
  // }

  // override onMouseDown(button: number): void {
  //   this.focus()

  //   let x = this.mouse.x - this.point.x
  //   let y = this.mouse.y - this.point.y

  //   const row = Math.max(0, Math.floor(y / (this.font.ch + this.ygap)))
  //   const col = Math.max(0, Math.floor(x / (this.font.cw + this.xgap)))

  //   this.row = Math.min(row, this.lines.length - 1)
  //   this.end = this.col = col
  //   this.fixCol()
  //   this.restartBlinking()
  //   this.reflectCursorPos()
  //   this.scrollCursorIntoView()
  //   this.adjust()
  // }

  override draw(ctx: DrawingContext): void {
    super.draw(ctx)

    for (let y = 0; y < this.model.lines.length; y++) {
      const line = this.model.lines[y]
      const py = y * this.font.ch + y * this.ygap + this.ygap / 2
      for (let x = 0; x < line.length; x++) {
        const px = x * this.font.cw + x * this.xgap
        const label = this.model.labels[y][x]
        const color = this.model.colors[label] ?? this.textColor
        this.font.print(ctx, px, py, color, line[x])
      }
    }
  }

  override adjust(): void {
    let cols = 0
    const rows = this.model.lines.length
    for (const line of this.model.lines) {
      if (line.length > cols) cols = line.length
    }
    cols++
    this.size = {
      w: (cols * this.font.cw) + (cols * this.xgap),
      h: (rows * this.font.ch) + (rows * this.ygap),
    }
  }

  // private findScrollAncestor() {
  //   let node = this.parent
  //   while (node) {
  //     if (node instanceof Scroll) return node
  //     node = node.parent
  //   }
  //   return node
  // }

  // scrollCursorIntoView = debounce(this._scrollCursorIntoView.bind(this))

  // private _scrollCursorIntoView() {
  //   const scroll = this.findScrollAncestor()
  //   if (!scroll) return

  //   let cx = this._cursor.point.x
  //   let cy = this._cursor.point.y

  //   let node = this._cursor
  //   while (node.parent !== scroll) {
  //     node = node.parent!
  //     cx += node.point.x
  //     cy += node.point.y
  //   }

  //   const maxy = scroll.area.size.h - this._cursor.size.h
  //   const maxx = scroll.area.size.w - this._cursor.size.w

  //   if (cy < 0) scroll.scrolly -= -cy
  //   if (cx < 0) scroll.scrollx -= -cx

  //   if (cy > maxy) scroll.scrolly -= maxy - cy
  //   if (cx > maxx) scroll.scrollx -= maxx - cx
  // }

  override onKeyPress(key: string): boolean {

    console.log(key)

    if (key.length === 1) {
      this.model.insert(key)
      this.restartCursorBlink.dispatch()
      return true
    }

    if (key === 'right') {
      this.model.moveCursorsRight()
      this.restartCursorBlink.dispatch()
      return true
    }

    if (key === 'shift right') {
      this.model.moveCursorsRight(true)
      this.restartCursorBlink.dispatch()
      return true
    }

    return false
  }

  // override onKeyPress(key: string): boolean {
  //   return false
  // }

  // override onKeyDown(key: string): boolean {
  //   if (key === 'Home') {
  //     const firstNonSpace = this.lines[this.row].match(/[^\s]/)?.index ?? 0
  //     if (sys.keymap.has('Control')) {
  //       this.row = 0
  //       this.end = this.col = 0
  //     }
  //     else if (this.col !== firstNonSpace) {
  //       this.end = this.col = firstNonSpace
  //     }
  //     else {
  //       this.end = this.col = 0
  //     }
  //   }
  //   else if (key === 'End') {
  //     if (sys.keymap.has('Control')) {
  //       this.row = this.lines.length - 1
  //       this.col = this.end = this.lines[this.row].length
  //     }
  //     else {
  //       this.end = this.col = this.lines[this.row].length
  //     }
  //   }
  //   else if (key === 'ArrowRight') {
  //     if (this.col < this.lines[this.row].length) {
  //       this.end = this.col = this.col + 1
  //     }
  //     else if (this.row < this.lines.length - 1) {
  //       this.col = this.end = 0
  //       this.row++
  //     }
  //   }
  //   else if (key === 'ArrowLeft') {
  //     if (this.col > 0) {
  //       this.end = this.col = this.col - 1
  //     }
  //     else if (this.row > 0) {
  //       this.row--
  //       this.end = this.col = this.lines[this.row].length
  //     }
  //   }
  //   else if (key === 'ArrowDown') {
  //     this.row = Math.min(this.row + 1, this.lines.length - 1)
  //     this.fixCol()
  //   }
  //   else if (key === 'ArrowUp') {
  //     this.row = Math.max(0, this.row - 1)
  //     this.fixCol()
  //   }
  //   else if (key === 'Tab') {
  //     if (this.onTab) {
  //       debounce(() => this.onTab?.())()
  //     }
  //     else {
  //       const [a, b] = this.halves()
  //       this.lines[this.row] = a + '  ' + b
  //       this.col += 2
  //       this.end = this.col
  //       this.adjust()
  //     }
  //   }
  //   else if (key === 'Backspace') {
  //     if (this.col > 0) {
  //       const [a, b] = this.halves()
  //       if (a === ' '.repeat(a.length) && a.length >= 2) {
  //         this.lines[this.row] = a.slice(0, -2) + b
  //         this.col -= 2
  //         this.end = this.col
  //         this.adjust()
  //       }
  //       else {
  //         this.lines[this.row] = a.slice(0, -1) + b
  //         this.col--
  //         this.end = this.col
  //         this.adjust()
  //       }
  //     }
  //     else if (this.row > 0) {
  //       this.end = this.lines[this.row - 1].length
  //       this.lines[this.row - 1] += this.lines[this.row]
  //       this.lines.splice(this.row, 1)
  //       this.row--
  //       this.col = this.end
  //       this.adjust()
  //     }
  //   }
  //   else if (key === 'Delete') {
  //     if (this.col < this.lines[this.row].length) {
  //       const [a, b] = this.halves()
  //       this.lines[this.row] = a + b.slice(1)
  //       this.adjust()
  //     }
  //     else if (this.row < this.lines.length - 1) {
  //       this.lines[this.row] += this.lines[this.row + 1]
  //       this.lines.splice(this.row + 1, 1)
  //       this.adjust()
  //     }
  //   }
  //   else if (key === 'Enter') {
  //     if (this.multiline) {
  //       const [a, b] = this.halves()
  //       this.lines[this.row] = a
  //       this.lines.splice(++this.row, 0, b)
  //       this.end = this.col = 0
  //       this.adjust()
  //     }
  //     else {
  //       debounce(() => this.onEnter?.())()
  //     }
  //   }
  //   else if (key === 'v' && sys.keymap.has('Control')) {
  //     sys.readClipboardText().then(text => {
  //       const [a, b] = this.halves()
  //       this.lines[this.row] = a + text + b
  //       this.col += text.length
  //       this.end = this.col
  //       this.adjust()

  //       this.highlight()
  //       this.restartBlinking()
  //       this.reflectCursorPos()
  //       this.scrollCursorIntoView()
  //     })
  //   }
  //   else if (key.length === 1 && !sys.keymap.has('Control') && !sys.keymap.has('Alt')) {
  //     const [a, b] = this.halves()
  //     this.lines[this.row] = a + key + b
  //     this.col++
  //     this.end = this.col
  //     this.adjust()
  //   }
  //   else {
  //     return false
  //   }

  //   this.highlight()
  //   this.restartBlinking()
  //   this.reflectCursorPos()
  //   this.scrollCursorIntoView()
  //   return true
  // }

  // private halves() {
  //   let line = this.lines[this.row]
  //   const first = line.slice(0, this.col)
  //   const last = line.slice(this.col)
  //   return [first, last] as const
  // }

  // private fixCol() {
  //   this.col = Math.min(this.lines[this.row].length, this.end)
  // }

  $focused = $(false)

  override onFocus(): void {
    this.$focused.val = true
    this.restartCursorBlink.dispatch()
  }

  override onBlur(): void {
    this.$focused.val = false
  }

}
