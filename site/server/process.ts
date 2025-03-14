import { wRPC, type ClientProg, type ServerSys } from '../shared/rpc.js'
import { Panel } from './panel.js'
import type { Sys } from './sys.js'

export class Process {

  static map = new Map<number, Process>()
  static id = 0
  id

  sys
  rpc

  constructor(sys: Sys, path: string) {
    this.sys = sys

    Process.map.set(this.id = ++Process.id, this)

    const absurl = new URL(path, import.meta.url)
    const worker = new Worker(absurl, { type: 'module' })

    this.rpc = wRPC<ServerSys, ClientProg>(worker)

    this.rpc.once('init').then(() => {
      this.rpc.send('init', [this.id])
    })

    this.rpc.listen('newpanel', (pos) => {
      const chan = new MessageChannel()
      const p = new Panel(sys.keymap, chan.port1, pos)
      this.rpc.send('newpanel', [p.id, p.x, p.y, p.w, p.h, chan.port2], [chan.port2])

      p.didAdjust.watch(() => sys.redrawAllPanels())
      p.didRedraw.watch(() => sys.redrawAllPanels())
    })
  }

}
