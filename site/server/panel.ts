import { Listener } from "../shared/listener.js"
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

  didAdjust = new Listener()
  didRedraw = new Listener()

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

    this.rpc.listen('adjust', (id, x, y, w, h) => {
      const panel = Panel.map.get(id)!
      panel.x = x
      panel.y = y
      panel.w = w
      panel.h = h
      this.didAdjust.dispatch()
    })

    this.rpc.listen('blit', (id, img) => {
      const panel = Panel.map.get(id)!
      panel.img?.close()
      panel.img = img
      this.didRedraw.dispatch()
    })

  }

  focus() { this.rpc.send('focus', []) }
  blur() { this.rpc.send('blur', []) }
  mouseenter() { this.rpc.send('mouseentered', []) }
  mousedown(b: number) { this.rpc.send('mousedown', [b]) }
  mouseup() { this.rpc.send('mouseup', []) }
  mousemove(x: number, y: number) { this.rpc.send('mousemoved', [x, y]) }
  mouseexit() { this.rpc.send('mouseexited', []) }

}
