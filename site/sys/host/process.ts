import type { Cursor } from "../api/core/cursor.js"
import { PanelEvent, wRPC, type ClientProgram, type ServerProgram } from "../api/core/rpc.js"
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
  status: 'alive' | 'zombie' | 'dead' = 'alive'
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
    // this.worker.onerror = (e) => console.error('WORKER ERROR', this.id, this.path, e)

    fetch(absurl).then(r => {
      if (r.status === 404) this.terminate()
    })

    this.procevents.postMessage({ type: 'started', pid: this.id, path: this.path })

    const rpc = this.rpc = new wRPC<ServerProgram, ClientProgram>(this.worker, {

      init: (reply) => {
        opts["app"] = path
        this.ready.resolve()
        this.procevents.postMessage({ type: 'init', pid: this.id })
        reply([sys.id, this.id, this.sys.size.w, this.sys.size.h, this.sys.desktop, [...this.sys.keymap], opts], [])
      },

      newpanel: (reply, title, ord, x, y, w, h) => {
        const chan = new MessageChannel()
        const p = new Panel(x, y, w, h, this, chan.port1, ord)
        reply([p.id, chan.port2], [chan.port2])

        this.panels.add(p)

        this.sys.panelevents.postMessage({
          type: 'new',
          pid: this.id,
          id: p.id,
          title,
          point: { x, y },
          size: { w, h },
        } as PanelEvent)

        p.didRedraw.watch(() => sys.redrawAllPanels())
      },

      adjust: (panid, x, y, w, h) => {
        const panel = Panel.all.get(panid)
        if (!panel) return

        panel.x = x
        panel.y = y
        panel.w = w
        panel.h = h
        panel.rpc.send('adjusted', [x, y, w, h])

        sys.panelevents.postMessage({
          type: 'adjusted',
          id: panid,
          point: { x, y },
          size: { w, h },
        } as PanelEvent)

        sys.redrawAllPanels()
      },

      focuspanel: (id) => {
        const panel = Panel.all.get(id)
        if (panel) this.focus(panel)
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

      hidepanel: (panid) => {
        this.setPanelVisible(panid, false)
      },

      showpanel: (panid) => {
        this.setPanelVisible(panid, true)
      },

      askdir: async (reply, opts) => {
        const folder = await self.showDirectoryPicker(opts)
        reply([folder], [])
      },

      thisfile: (file) => {
        this.file = file
        this.sys.updateLocation()
      },

      getprocs: (reply) => {
        reply([Process.all.values().map(p => ({
          path: p.path,
          pid: p.id,
        })).toArray()])
      },

      readcliptext: async (reply) => {
        const text = await navigator.clipboard.readText()
        reply([text])
      },

      setdesktop: (x, y, w, h) => {
        this.sys.setDesktop(x, y, w, h)
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
        if (this.status === 'alive') {
          this.status = 'zombie'
          this.panels.forEach(p => p.showSpinner())
          sys.redrawAllPanels()
        }
      }
      else {
        if (this.status === 'zombie') {
          this.status = 'alive'
          this.panels.forEach(p => p.hideSpinner())
          sys.redrawAllPanels()
        }
      }
    }, 3000)
  }

  setPanelVisible(panid: number, visible: boolean) {
    const panel = Panel.all.get(panid)
    if (!panel) return

    panel.visible = visible

    if (!visible && this.sys.focused === panel) {
      const idx = Panel.ordered.indexOf(panel)
      const nextInLine = Panel.ordered.slice(0, idx).toReversed().find(p => p.visible)
      if (nextInLine) this.sys.focusPanel(nextInLine)
    }

    this.sys.redrawAllPanels()
  }

  focus(panel: Panel) {
    this.sys.focusPanel(panel)
  }

  useCursor(c: Cursor | null) {
    this.sys.useCursor(c)
  }

  terminate() {
    this.status = 'dead'
    Process.all.delete(this.id)
    clearInterval(this.heartbeat)
    this.worker.terminate()
    for (const panel of this.panels) {
      this.closePanel(panel)
    }
    this.procevents.postMessage({ type: 'ended', pid: this.id })
  }

  closePanel(panel: Panel) {
    this.sys.panelevents.postMessage({ type: 'closed', id: panel.id } as PanelEvent)
    panel.closePort()
    this.sys.removePanel(panel)
    this.panels.delete(panel)
  }

}
