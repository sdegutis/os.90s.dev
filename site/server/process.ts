import type { Cursor } from '../shared/cursor.js'
import { wRPC, type ClientProgram, type ServerProgram } from '../shared/rpc.js'
import { Panel } from './panel.js'
import type { Sys } from './sys.js'

export class Process {

  static all = new Map<number, Process>()
  static id = 0

  id

  private sys: Sys
  private worker
  private panels = new Set<Panel>()

  heartbeat
  dead = false

  constructor(sys: Sys, path: string) {
    Process.all.set(this.id = ++Process.id, this)

    this.sys = sys

    const absurl = new URL(path, import.meta.url)
    this.worker = new Worker(absurl, { type: 'module' })

    const rpc = wRPC<ServerProgram, ClientProgram>(this.worker)

    rpc.once('terminate').then(() => {
      console.log('terminating in server', this.id)
      this.terminate()
    })

    rpc.once('init').then(() => {
      rpc.send('init', [this.id, this.sys.width, this.sys.height])
    })

    this.heartbeat = setInterval(async () => {
      const n = Math.ceil(Math.random() * 1000)
      const expected = n % 2 === 0 ? n + 2 : n + 1

      rpc.send('ping', [n])

      const got = await Promise.race([
        rpc.once('pong').then(([n]) => n),
        new Promise((r) => setTimeout(r, 1000))
      ])

      if (got !== expected) {
        if (!this.dead) {
          this.dead = true
          this.panels.forEach(p => p.showSpinner())
          sys.redrawAllPanels()
        }
      }
      else {
        if (this.dead) {
          this.dead = false
          this.panels.forEach(p => p.hideSpinner())
          sys.redrawAllPanels()
        }
      }
    }, 300)

    rpc.listen('newpanel', (ord, x, y, w, h) => {
      const chan = new MessageChannel()
      const p = new Panel({ x, y, w, h }, this, chan.port1, ord)
      rpc.send('newpanel', [p.id, p.x, p.y, chan.port2], [chan.port2])

      this.panels.add(p)

      p.didAdjust.watch(() => sys.redrawAllPanels())
      p.didRedraw.watch(() => sys.redrawAllPanels())
    })
  }

  useCursor(c: Cursor | null) {
    this.sys.useCursor(c)
  }

  terminate() {
    clearInterval(this.heartbeat)
    this.worker.terminate()
    for (const panel of this.panels) {
      this.closePanel(panel)
    }
  }

  closePanel(panel: Panel) {
    panel.closePort()
    this.sys.removePanel(panel)
  }

}
