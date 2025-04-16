import { Cursor } from "../api/core/cursor.js"
import { DrawingContext } from "../api/core/drawing.js"
import { Listener } from "../api/core/listener.js"
import { wRPC, type ClientPanel, type PanelOrdering, type ServerPanel } from "../api/core/rpc.js"
import type { Process } from "./process.js"

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

  name
  proc
  port
  rpc
  pos

  didRedraw = new Listener()

  visible = true

  constructor(
    name: string,
    x: number, y: number,
    w: number, h: number,
    proc: Process,
    port: MessagePort,
    pos: PanelOrdering,
  ) {
    this.name = name
    this.proc = proc
    this.port = port
    this.pos = pos
    this.x = x
    this.y = y
    this.w = w
    this.h = h

    Panel.all.set(this.id = ++Panel.id, this)

    const posi = pos === 'bottom' ? 0 :
      pos === 'top' ? Panel.ordered.length :
        Panel.ordered.findLastIndex(p => p.pos !== 'top') + 1
    Panel.ordered.splice(posi, 0, this)

    this.rpc = new wRPC<ServerPanel, ClientPanel>(port, {

      blit: (img) => {
        this.img?.close()
        this.img = img
        this.didRedraw.dispatch()
      },

      close: () => {
        proc.closePanel(this)
      },

      focus: () => {
        this.proc.focus(this)
      },

      cursor: (cstr) => {
        proc.useCursor(cstr ? Cursor.fromString(cstr) : null)
      },

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

  showSpinner() {
    const ctx = new DrawingContext(this.w, this.h)

    if (this.img) ctx.drawImage(this.img, 0, 0)

    ctx.fillRect(0, 0, this.w, this.h, 0xffffff33)

    const font = this.proc.sys.font
    const str = 'app not responding\nfix the problem or\nrightclick to quit'
    const size = font.calcSize(str)

    const px = Math.floor(this.w / 2 - size.w / 2)
    const py = Math.floor(this.h / 2 - size.h / 2)

    ctx.fillRect(px - 3, py - 3, size.w + 6, size.h + 6, 0x333333ff)

    font.print(ctx, px + 1, py + 1, 0x000000ff, str)
    font.print(ctx, px, py, 0xffffffff, str)

    this.img = ctx.canvas.transferToImageBitmap()
  }

  hideSpinner() {
    this.rpc.send('needblit', [])
  }

}
