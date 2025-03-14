import { Listener } from "../shared/listener.js"
import { wRPC, type ClientPanel, type PanelPos, type ServerPanel } from "../shared/rpc.js"

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

  pos
  rpc

  didAdjust = new Listener()
  didRedraw = new Listener()

  constructor(port: MessagePort, pos: PanelPos) {
    this.rpc = wRPC<ServerPanel, ClientPanel>(port)
    this.pos = pos

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
  wheel(n: number) { this.rpc.send('wheel', [n]) }
  mousemove(x: number, y: number) { this.rpc.send('mousemoved', [x, y]) }
  mouseexit() { this.rpc.send('mouseexited', []) }

}
