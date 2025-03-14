import { sysRPC } from '../shared/rpc.js'
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

    this.rpc = sysRPC(worker)

    this.rpc.once('init').then(() => {
      this.rpc.send('init', [this.id])
    })

    this.rpc.listen('newpanel', (pos) => {
      const p = new Panel(this, pos)
      this.rpc.send('newpanel', [p.id, p.x, p.y, p.w, p.h])
    })

    this.rpc.listen('adjpanel', (id, x, y, w, h) => {
      const panel = Panel.map.get(id)!
      panel.x = x
      panel.y = y
      panel.w = w
      panel.h = h
    })

    this.rpc.listen('blitpanel', (id, img) => {
      const panel = Panel.map.get(id)!
      panel.img?.close()
      panel.img = img
      sys.redrawAllPanels()
    })

  }

}
