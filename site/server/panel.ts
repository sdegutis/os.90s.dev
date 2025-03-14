import { wRPC, type FromPanel, type PanelPos, type ToPanel } from "../shared/rpc.js"
import type { Process } from "./process.js"

export class Panel {

  static focused?: Panel
  static ordered: Panel[] = []
  static map = new Map<number, Panel>()
  static id = 0
  id

  x = 0
  y = 0
  w = 100
  h = 100

  img?: ImageBitmap

  proc
  pos
  rpc

  constructor(proc: Process, pos: PanelPos, port: MessagePort) {
    this.proc = proc
    this.pos = pos
    this.rpc = wRPC<ToPanel, FromPanel>(port)

    Panel.map.set(this.id = ++Panel.id, this)

    const posi = pos === 'bottom' ? 0 : Panel.ordered.length
    Panel.ordered.splice(posi, 0, this)

    this.x = (Panel.focused?.x ?? 0) + 10
    this.y = (Panel.focused?.y ?? 0) + 10

    Panel.focused = this
  }

  focus() { this.proc.rpc.send('focus', [this.id]) }
  blur() { this.proc.rpc.send('blur', [this.id]) }
  mouseenter() { this.proc.rpc.send('mouseentered', [this.id]) }
  mousedown(b: number) { this.proc.rpc.send('mousedown', [this.id, b]) }
  mouseup() { this.proc.rpc.send('mouseup', [this.id]) }
  mousemove(x: number, y: number) {
    this.rpc.send('mousemoved', [x, y])
  }
  mouseexit() { this.proc.rpc.send('mouseexited', [this.id]) }

}
