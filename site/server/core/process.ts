import { Panel } from "./panel.js"
import type { Sys } from "./sys.js"
import type { Cursor } from "/client/core/cursor.js"
import { wRPC, type ClientProgram, type ServerProgram } from "/client/core/rpc.js"
import { fs } from "/server/fs/fs.js"

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

  constructor(sys: Sys, path: string, opts: Record<string, any>) {
    Process.all.set(this.id = ++Process.id, this)

    this.sys = sys

    const absurl = new URL('exec.js', import.meta.url)
    absurl.searchParams.set('opts', JSON.stringify({ ...opts, app: path }))
    this.worker = new Worker(absurl, { type: 'module' })

    const rpc = this.rpc = new wRPC<ServerProgram, ClientProgram>(this.worker, {

      init: (reply) => {
        const fontstr = fs.get('sys/data/crt34.font')!
        reply([this.id, this.sys.size.w, this.sys.size.h, [...this.sys.keymap], fontstr], [])
      },

      newpanel: (reply, ord, x, y, w, h) => {
        const chan = new MessageChannel()
        const p = new Panel({ x, y, w, h }, this, chan.port1, ord, sys)
        reply([p.id, p.x, p.y, chan.port2], [chan.port2])

        this.panels.add(p)

        p.didAdjust.watch(() => sys.redrawAllPanels())
        p.didRedraw.watch(() => sys.redrawAllPanels())
      },

      launch: (reply, path, opts) => {
        const pid = this.sys.launch(path, opts)
        reply([pid], [])
      },

      terminate: (pid) => {
        Process.all.get(pid)?.terminate()
      },

      resize: (w, h) => {
        sys.resize(w, h)
      },

      getfile: (reply, path) => {
        const content = fs.get(path)
        reply([content], [])
      },

      putfile: (reply, path, content) => {
        fs.put(path, content)
        reply([], [])
      },

      listdrives: (reply) => {
        reply(fs.drives(), [])
      },

      listdir: (reply, path) => {
        reply(fs.list(path), [])
      },

      mount: async (reply, name) => {
        await fs.mount(name)
        reply([], [])
      },

      unmount: async (reply, name) => {
        fs.unmount(name)
        reply([], [])
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
  }

  closePanel(panel: Panel) {
    panel.closePort()
    this.sys.removePanel(panel)
  }

}
