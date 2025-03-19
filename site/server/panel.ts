import { Cursor } from "../shared/cursor.js"
import { Listener } from "../shared/listener.js"
import { wRPC, type ClientPanel, type PanelOrdering, type ServerPanel } from "../shared/rpc.js"
import type { Process } from "./process.js"

type Rect = { x: number, y: number, w: number, h: number }

export class Panel {

  static ordered: Panel[] = []
  static all = new Map<number, Panel>()
  static id = 0
  id

  x = 0
  y = 0
  w
  h

  img?: ImageBitmap

  port
  rpc
  pos

  didAdjust = new Listener()
  didRedraw = new Listener()

  constructor(rect: Rect, proc: Process, port: MessagePort, pos: PanelOrdering) {
    this.port = port
    this.rpc = wRPC<ServerPanel, ClientPanel>(port)
    this.pos = pos

    this.x = rect.x
    this.y = rect.y
    this.w = rect.w
    this.h = rect.h

    Panel.all.set(this.id = ++Panel.id, this)

    const posi = pos === 'bottom' ? 0 : Panel.ordered.findLastIndex(p => p.pos !== 'top') + 1
    Panel.ordered.splice(posi, 0, this)

    if (this.x === -1 || this.y === -1) {
      const cascadeFrom = Panel.ordered.findLast(p => p.pos === 'normal' && p !== this)
      this.x = (cascadeFrom?.x ?? 0) + 10
      this.y = (cascadeFrom?.y ?? 0) + 10
    }

    this.rpc.once('close').then(() => {
      proc.closePanel(this)
    })

    this.rpc.listen('cursor', (cstr) => {
      proc.useCursor(cstr ? Cursor.fromString(cstr) : null)
    })

    this.rpc.listen('adjust', (x, y, w, h) => {
      this.x = x
      this.y = y
      this.w = w
      this.h = h
      this.didAdjust.dispatch()
    })

    this.rpc.listen('blit', (img) => {
      this.img?.close()
      this.img = img
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
