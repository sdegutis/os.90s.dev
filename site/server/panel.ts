import { Listener } from "../shared/listener.js"
import { wRPC, type ClientPanel, type KeyMap, type PanelPos, type ServerPanel } from "../shared/rpc.js"

export class Panel {

  static focused?: Panel
  static ordered: Panel[] = []
  static all = new Map<number, Panel>()
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

  keymap: KeyMap

  constructor(keymap: KeyMap, port: MessagePort, pos: PanelPos) {
    this.rpc = wRPC<ServerPanel, ClientPanel>(port)
    this.pos = pos
    this.keymap = keymap

    Panel.all.set(this.id = ++Panel.id, this)

    const posi = pos === 'bottom' ? 0 : Panel.ordered.length
    Panel.ordered.splice(posi, 0, this)

    this.x = (Panel.focused?.x ?? 0) + 10
    this.y = (Panel.focused?.y ?? 0) + 10

    Panel.focused = this

    this.rpc.listen('adjust', (id, x, y, w, h) => {
      const panel = Panel.all.get(id)!
      panel.x = x
      panel.y = y
      panel.w = w
      panel.h = h
      this.didAdjust.dispatch()
    })

    this.rpc.listen('blit', (id, img) => {
      const panel = Panel.all.get(id)!
      panel.img?.close()
      panel.img = img
      this.didRedraw.dispatch()
    })

  }

  focus() { this.rpc.send('focus', [this.keymap]) }
  blur() { this.rpc.send('blur', []) }
  mouseenter() { this.rpc.send('mouseentered', []) }
  mouseexit() { this.rpc.send('mouseexited', []) }
  mousemove(x: number, y: number) { this.rpc.send('mousemoved', [x, y]) }
  mousedown(b: number) { this.rpc.send('mousedown', [b]) }
  mouseup() { this.rpc.send('mouseup', []) }
  wheel(n: number) { this.rpc.send('wheel', [n]) }
  keydown(key: string) { this.rpc.send('keydown', [key]) }
  keyup(key: string) { this.rpc.send('keyup', [key]) }

}
