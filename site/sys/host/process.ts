import type { Cursor } from "../api/core/cursor.js"
import { wRPC, type ClientProgram, type ServerProgram } from "../api/core/rpc.js"
import { Panel } from "./panel.js"
import type { Sys } from "./sys.js"

export class Process {

  static all = new Map<number, Process>()
  static id = 0

  id

  sys: Sys
  private worker
  private panels = new Set<Panel>()

  heartbeat
  dead = false
  rpc

  path: string
  file?: string

  ready = Promise.withResolvers<void>()

  procevents = new BroadcastChannel('procevents')

  constructor(sys: Sys, path: string, opts: Record<string, any>) {
    this.id = ++Process.id
    Process.all.set(this.id, this)

    this.sys = sys
    this.path = path
    this.file = opts["file"]

    const absurl = new URL('/fs/' + path, import.meta.url)
    this.worker = new Worker(absurl, { type: 'module' })
    this.worker.onerror = (e) => console.error('WORKER ERROR', this.id, this.path, e)

    fetch(absurl).then(r => {
      if (r.status === 404) this.terminate()
    })

    this.procevents.postMessage({ type: 'started', pid: this.id, path: this.path })

    const rpc = this.rpc = new wRPC<ServerProgram, ClientProgram>(this.worker, {

      init: (reply) => {
        opts["app"] = path
        this.ready.resolve()
        this.procevents.postMessage({ type: 'init', pid: this.id })
        reply([this.id, this.sys.size.w, this.sys.size.h, [...this.sys.keymap], opts], [])
      },

      newpanel: (reply, ord, x, y, w, h) => {
        const chan = new MessageChannel()
        const p = new Panel({ x, y, w, h }, this, chan.port1, ord, sys)
        reply([p.id, p.x, p.y, chan.port2], [chan.port2])

        this.panels.add(p)

        p.didAdjust.watch(() => sys.redrawAllPanels())
        p.didRedraw.watch(() => sys.redrawAllPanels())
      },

      launch: async (reply, path, opts) => {
        const pid = await this.sys.launch(path, opts)
        reply([pid])
      },

      terminate: (pid) => {
        Process.all.get(pid)?.terminate()
      },

      resize: (w, h) => {
        sys.resize(w, h)
      },

      askdir: async (reply, opts) => {
        const folder = await self.showDirectoryPicker(opts)
        reply([folder], [])
      },

      thisfile: (file) => {
        this.file = file
        this.sys.reflectCurrentApp()
      },

      getprocs: (reply) => {
        reply([Process.all.values().map(p => ({
          path: p.path,
          pid: p.id,
        })).toArray()])
      },

    })

    this.heartbeat = setInterval(async () => {
      const n = Math.ceil(Math.random() * 1000)
      const expected = n % 2 === 0 ? n + 2 : n + 1

      const got = await Promise.race([
        rpc.call('ping', [n]).then(([n]) => n),
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
    }, 3000)
  }

  focus(panel: Panel) {
    this.sys.focusPanel(panel)
  }

  useCursor(c: Cursor | null) {
    this.sys.useCursor(c)
  }

  terminate() {
    Process.all.delete(this.id)
    clearInterval(this.heartbeat)
    this.worker.terminate()
    for (const panel of this.panels) {
      this.closePanel(panel)
    }
    this.procevents.postMessage({ type: 'ended', pid: this.id })
  }

  closePanel(panel: Panel) {
    panel.closePort()
    this.sys.removePanel(panel)
  }

}
