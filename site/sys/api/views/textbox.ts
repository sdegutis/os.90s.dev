import { DrawingContext } from "../core/drawing.js"
import { Listener } from "../core/listener.js"
import { $, makeRef, multiplex } from "../core/ref.js"
import { sys } from "../core/sys.js"
import { JsxAttrs } from "../jsx.js"
import { TextModel } from "../text/model.js"
import { debounce } from "../util/throttle.js"
import { Scroll } from "./scroll.js"
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

    this.model.onTextChanged.watch(() => {
      this.adjust()
      this.needsRedraw()
      this.scrollCursorIntoView()
    })

    this.model.onCursorsMoved.watch(() => {
      this.needsRedraw()
      this.scrollCursorIntoView()
    })
  }

  model = new TextModel()

  font = sys.$font.val
  $font = makeRef(this, 'font')

  cursorColor = 0x0000ff99
  $cursorColor = makeRef(this, 'cursorColor')

  textColor = 0xffffffff
  $textColor = makeRef(this, 'textColor')

  editable = true

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
    this.focus()

    if (sys.keymap.has('Alt')) {
      const { row, col } = this.posAtMouse()
      this.model.addCursor(row, col)
      return
    }

    this.moveCursor(false)

    this.onMouseMove = debounce(() => this.moveCursor(true))
    this.onMouseUp = () => delete this.onMouseMove
  }

  private posAtMouse() {
    const row = Math.max(0, Math.floor(this.mouse.y / (this.font.ch + this.ygap)))
    const col = Math.max(0, Math.floor(this.mouse.x / (this.font.cw + this.xgap)))
    return { row, col }
  }

  private moveCursor(selecting: boolean) {
    const { row, col } = this.posAtMouse()
    this.model.moveCursorTo(row, col, selecting)
    this.restartCursorBlink.dispatch()
    this.scrollCursorIntoView()
  }

  override draw(ctx: DrawingContext): void {
    super.draw(ctx)

    for (let y = 0; y < this.model.lines.length; y++) {
      const line = this.model.lines[y]
      const py = y * this.font.ch
      let px = 0
      for (const span of line.spans) {
        const color = this.model.highlighter?.colors[span.state] ?? this.textColor
        this.font.print(ctx, px, py, color, span.text)
        px += span.text.length * this.font.cw
      }
    }
  }

  override adjust(): void {
    let cols = 0
    const rows = this.model.lines.length
    for (const line of this.model.lines) {
      if (line.text.length > cols) cols = line.text.length
    }
    cols++
    this.size = {
      w: (cols * this.font.cw) + (cols * this.xgap),
      h: (rows * this.font.ch) + (rows * this.ygap),
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

  scrollCursorIntoView = debounce(this._scrollCursorIntoView.bind(this))

  private _scrollCursorIntoView() {
    const scroll = this.findScrollAncestor()
    if (!scroll) return

    const cursor = this.children.at(-1)!

    let cx = cursor.point.x
    let cy = cursor.point.y

    let node = cursor
    while (node.parent !== scroll) {
      node = node.parent!
      cx += node.point.x
      cy += node.point.y
    }

    const maxy = scroll.area.size.h - cursor.size.h
    const maxx = scroll.area.size.w - cursor.size.w

    if (cy < 0) scroll.scrolly -= -cy
    if (cx < 0) scroll.scrollx -= -cx

    if (cy > maxy) scroll.scrolly -= maxy - cy
    if (cx > maxx) scroll.scrollx -= maxx - cx
  }

  ifEditable<T extends (...args: any[]) => any>(fn: T) {
    return (...args: any[]) => {
      if (this.editable) return fn(...args)
    }
  }

  keyHandlers: [RegExp, (...groups: string[]) => void | boolean][] = [
    [/^(.)$/, this.ifEditable((ch) => this.model.insertText(ch))],
    [/^enter$/, this.ifEditable(() => this.onEnter ? this.onEnter() : this.model.insertNewline())],
    [/^delete$/, this.ifEditable(() => this.model.delete())],
    [/^tab$/, this.ifEditable(() => this.model.insertTab())],
    [/^backspace$/, this.ifEditable(() => this.model.backspace())],
    [/^(shift )?(right)$/, (shift) => this.model.moveCursorsRight(!!shift)],
    [/^(shift )?(left)$/, (shift) => this.model.moveCursorsLeft(!!shift)],
    [/^(shift )?(down)$/, (shift) => this.model.moveCursorsDown(!!shift)],
    [/^(shift )?(up)$/, (shift) => this.model.moveCursorsUp(!!shift)],
    [/^(shift )?home$/, (shift) => this.model.moveToBeginningOfLine(!!shift)],
    [/^(shift )?end$/, (shift) => this.model.moveToEndOfLine(!!shift)],
    [/^ctrl (shift )?home$/, (shift) => this.model.moveToBeginningOfDocument(!!shift)],
    [/^ctrl (shift )?end$/, (shift) => this.model.moveToEndOfDocument(!!shift)],
    [/^ctrl alt up$/, () => this.model.addCursorAbove()],
    [/^ctrl alt down$/, () => this.model.addCursorBelow()],
    [/^escape$/, () => this.model.cursors.length > 1
      ? this.model.removeExtraCursors()
      : true],
    [/^ctrl v$/, () => {
      this.ifEditable(() => {
        sys.readClipboardText().then(text => {
          this.model.insertText(text)
        })
      })
    }],
  ]

  override onKeyPress(key: string): boolean {
    // console.log(key)
    for (const [r, fn] of this.keyHandlers) {
      const m = key.match(r)
      if (m) {
        const result = fn(...m.slice(1))
        this.restartCursorBlink.dispatch()
        return !result
      }
    }
    return false
  }

  $focused = $(false)

  override onFocus(): void {
    this.$focused.val = true
    this.restartCursorBlink.dispatch()
  }

  override onBlur(): void {
    this.$focused.val = false
  }

}
