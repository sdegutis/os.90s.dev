import { Listener } from "../shared/listener.js"
import { wRPC, type ClientPanel, type PanelPos, type ServerPanel } from "../shared/rpc.js"
import type { Process } from "./process.js"

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

  port
  rpc
  pos

  didAdjust = new Listener()
  didRedraw = new Listener()

  constructor(proc: Process, port: MessagePort, pos: PanelPos) {
    this.port = port
    this.rpc = wRPC<ServerPanel, ClientPanel>(port)
    this.pos = pos

    Panel.all.set(this.id = ++Panel.id, this)

    const posi = pos === 'bottom' ? 0 : Panel.ordered.length
    Panel.ordered.splice(posi, 0, this)

    this.x = (Panel.focused?.x ?? 0) + 10
    this.y = (Panel.focused?.y ?? 0) + 10

    Panel.focused = this

    this.rpc.once('close').then(() => {
      proc.closePanel(this)
    })

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

  moveToFront() {
    if (this.pos !== 'normal') return

    const oldi = Panel.ordered.indexOf(this)
    const newi = Panel.ordered.findLastIndex(p => p.pos !== 'top')
    if (oldi === newi) return

    Panel.ordered.splice(oldi, 1)
    Panel.ordered.splice(newi, 0, this)
  }

  closePort() {
    this.port.close()
  }

}
