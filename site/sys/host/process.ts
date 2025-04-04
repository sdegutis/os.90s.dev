import type { Cursor } from "../api/core/cursor.js"
import type { ListenerDone } from "../api/core/listener.js"
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

  procwatchers: ListenerDone | undefined

  ready = Promise.withResolvers<void>()

  constructor(sys: Sys, path: string, opts: Record<string, any>) {
    this.id = ++Process.id
    Process.all.set(this.id, this)

    this.sys = sys
    this.path = path
    this.file = opts["file"]

    const absurl = new URL('/fs/' + path, import.meta.url)
    this.worker = new Worker(absurl, { type: 'module' })

    const rpc = this.rpc = new wRPC<ServerProgram, ClientProgram>(this.worker, {

      init: (reply) => {
        const syncfs = new SharedWorker(import.meta.resolve('./syncfs.js'), { type: 'module' })

        opts["app"] = path
        this.ready.resolve()
        this.sys.procBegan.dispatch(this.id)
        reply([this.id, this.sys.size.w, this.sys.size.h, [...this.sys.keymap], opts, syncfs.port], [syncfs.port])
      },

      newpanel: (reply, ord, x, y, w, h) => {
        const chan = new MessageChannel()
        const p = new Panel({ x, y, w, h }, this, chan.port1, ord, sys)
        reply([p.id, p.x, p.y, chan.port2], [chan.port2])

        this.panels.add(p)

        p.didAdjust.watch(() => sys.redrawAllPanels())
        p.didRedraw.watch(() => sys.redrawAllPanels())
      },

      watchprocs: (reply) => {
        if (!this.procwatchers) {
          const watcher1 = sys.procBegan.watch((pid) => rpc.send('procbegan', [pid]))
          const watcher2 = sys.procEnded.watch((pid) => rpc.send('procended', [pid]))
          this.procwatchers = () => {
            watcher1()
            watcher2()
          }
        }
        reply([])
      },

      openipc: (reply, pid) => {
        const proc = Process.all.get(pid)
        if (!proc) {
          reply([null])
          return
        }

        const chan = new MessageChannel()
        reply([chan.port1], [chan.port1])
        proc.rpc.send('gotipc', [chan.port2], [chan.port2])
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

      askdir: async (reply) => {
        const folder = await self.showDirectoryPicker()
        reply([folder], [])
      },

      thisfile: (file) => {
        this.file = file
        this.sys.reflectCurrentApp()
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
    clearInterval(this.heartbeat)
    this.worker.terminate()
    for (const panel of this.panels) {
      this.closePanel(panel)
    }
    this.sys.procEnded.dispatch(this.id)
    this.procwatchers?.()
  }

  closePanel(panel: Panel) {
    panel.closePort()
    this.sys.removePanel(panel)
  }

}
