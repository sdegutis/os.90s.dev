import { $, multiplex } from "../core/ref.js"
import { JsxAttrs } from "../jsx.js"
import { Border } from "./border.js"
import { Scroll } from "./scroll.js"
import { TextBox } from "./textbox.js"
import { View } from "./view.js"

export class TextField extends View {

  constructor(config?: JsxAttrs<TextField>) {
    super()
    this.setup(config)
  }

  $length = $<number>(50)
  get length() { return this.$length.val }
  set length(val) { this.$length.val = val }

  textbox = new TextBox({
    multiline: false,
  })

  border = new Border({
    padding: 2,
    children: [this.textbox],
  })

  scroll = new Scroll({
    showh: false,
    showv: false,
    background: 0x00000033,
    onMouseDown: (...args) => this.textbox.onMouseDown(...args),
    onMouseMove: (...args) => this.textbox.onMouseMove(...args),
    $size: multiplex([this.border.$size, this.$length], () => {
      return { w: this.length, h: this.border.$size.val.h }
    }),
    children: [this.border],
  })

  override init(): void {
    super.init()
    this.children = [this.scroll]
    this.scroll.$size.watch(s => this.size = s)
    this.size = this.scroll.size
  }

  override get background() { return this.scroll.background }
  override set background(val) { this.scroll.background = val }

  get text() { return this.textbox.text }
  set text(val) { this.textbox.text = val }

  get padding() { return this.border.padding }
  set padding(val) { this.border.padding = val }

  override get autofocus() { return this.textbox.autofocus }
  override set autofocus(val) { this.textbox.autofocus = val }

}
