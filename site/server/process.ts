import { wRPC, type ClientProg, type ServerSys } from '../shared/rpc.js'
import { Panel } from './panel.js'
import type { Sys } from './sys.js'

export class Process {

  static all = new Map<number, Process>()
  static id = 0

  id

  private sys: Sys
  private worker
  private panels = new Set<Panel>()

  constructor(sys: Sys, path: string) {
    Process.all.set(this.id = ++Process.id, this)

    this.sys = sys

    const absurl = new URL(path, import.meta.url)
    this.worker = new Worker(absurl, { type: 'module' })

    const rpc = wRPC<ServerSys, ClientProg>(this.worker)

    rpc.once('init').then(() => {
      rpc.send('init', [this.id])
    })

    rpc.listen('newpanel', (pos) => {
      const chan = new MessageChannel()
      const p = new Panel(chan.port1, pos)
      rpc.send('newpanel', [p.id, p.x, p.y, p.w, p.h, chan.port2], [chan.port2])

      this.panels.add(p)

      p.didAdjust.watch(() => sys.redrawAllPanels())
      p.didRedraw.watch(() => sys.redrawAllPanels())
    })
  }

  terminate() {
    this.worker.terminate()
    for (const panel of this.panels) {
      panel.closePort()
      this.sys.removePanel(panel)
    }
  }

}
