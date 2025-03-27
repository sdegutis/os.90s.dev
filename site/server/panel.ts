import { ClientPanel, PanelOrdering, ServerPanel, wRPC } from "../client/core/rpc.js"
import { Process } from "/server/process.js"
import { Sys } from "/server/sys.js"
import { Cursor } from "/shared/cursor.js"
import { DrawingContext } from "/shared/drawing.js"
import { crt34 } from "/shared/font.js"
import { Listener } from "/shared/listener.js"

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

  proc
  port
  rpc
  pos

  didAdjust = new Listener()
  didRedraw = new Listener()

  constructor(rect: Rect, proc: Process, port: MessagePort, pos: PanelOrdering, sys: Sys) {
    this.proc = proc
    this.port = port
    this.pos = pos

    this.x = rect.x
    this.y = rect.y
    this.w = rect.w
    this.h = rect.h

    Panel.all.set(this.id = ++Panel.id, this)

    const posi = pos === 'bottom' ? 0 :
      pos === 'top' ? Panel.ordered.length :
        Panel.ordered.findLastIndex(p => p.pos !== 'top') + 1
    Panel.ordered.splice(posi, 0, this)

    const positioning = (this.x === -1 || this.y === -1) ? 'default' :
      (this.x === -2 || this.y === -2) ? 'center' :
        'given'

    if (positioning === 'default') {
      const cascadeFrom = Panel.ordered.findLast(p => p.pos === 'normal' && p !== this)
      this.x = (cascadeFrom?.x ?? 0) + 10
      this.y = (cascadeFrom?.y ?? 0) + 10
    }
    else if (positioning === 'center') {
      this.x = Math.round(sys.size.w / 2 - this.w / 2)
      this.y = Math.round(sys.size.h / 2 - this.h / 2)
    }

    this.rpc = new wRPC<ServerPanel, ClientPanel>(port, {

      adjust: (x, y, w, h) => {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.didAdjust.dispatch()
      },

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

    const font = crt34
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
