import { BC, ProcEvent } from "../api/core/bc.js"
import { Cursor } from "../api/core/cursor.js"
import { PanelInfo, wRPC, type ClientProgram, type ServerProgram } from "../api/core/rpc.js"
import { cursors } from "./cursors.js"
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

  procevents

  constructor(sys: Sys, path: string, opts: Record<string, any>, optsTs: Transferable[]) {
    this.id = ++Process.id
    Process.all.set(this.id, this)

    this.sys = sys
    this.path = path
    this.file = opts["file"]

    this.procevents = new BC<ProcEvent>('procevents', this.sys.id)

    const absurl = new URL('/os/fs/' + path, import.meta.url)
    this.worker = new Worker(absurl, { type: 'module' })
    // this.worker.onerror = (e) => console.error('WORKER ERROR', this.id, this.path, e)

    fetch(absurl).then(r => {
      if (r.status === 404) {
        this.ready.reject(new Error(`404: ${this.path}`))
        this.terminate()
      }
    })

    this.procevents.emit({ type: 'started', pid: this.id, path: this.path })

    const rpc = this.rpc = new wRPC<ServerProgram, ClientProgram>(this.worker, {

      init: (reply) => {
        opts["app"] = path
        this.ready.resolve()
        this.procevents.emit({ type: 'init', pid: this.id })
        reply([sys.id, this.id, this.sys.size.w, this.sys.size.h, this.sys.desktop, [...this.sys.keymap], opts], optsTs)
      },

      newpanel: (reply, name, ord, x, y, w, h) => {
        const chan = new MessageChannel()
        const p = new Panel(name, x, y, w, h, this, chan.port1, ord)
        reply([p.id, chan.port2], [chan.port2])

        this.panels.add(p)

        this.sys.panelevents.emit({
          type: 'new',
          pid: this.id,
          id: p.id,
          name,
          point: { x, y },
          size: { w, h },
          visible: true,
          focused: false,
        })

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

        sys.panelevents.emit({
          type: 'adjusted',
          id: panid,
          point: { x, y },
          size: { w, h },
        })

        sys.redrawAllPanels()
      },

      getpanels: (reply) => {
        reply([Panel.ordered.map(p => ({
          pid: this.id,
          id: p.id,
          name: p.name,
          point: { x: p.x, y: p.y },
          size: { w: p.w, h: p.h },
          focused: p === this.sys.focused,
          visible: p.visible,
        } satisfies PanelInfo))])
      },

      focuspanel: (id) => {
        const panel = Panel.all.get(id)
        if (panel) this.focus(panel)
      },

      launch: async (reply, path, opts, optsTs) => {
        const pid = await this.sys.launch(path, opts, optsTs)
        reply([pid])
      },

      openipc: async (reply, pid) => {
        const other = Process.all.get(pid)
        if (!other) return reply([null])

        const c = new MessageChannel()
        reply([c.port1], [c.port1])
        other.rpc.send('gotipc', [c.port2], [c.port2])
      },

      terminate: (pid) => {
        Process.all.get(pid)?.terminate()
      },

      resize: (w, h) => {
        sys.$size.set({ w, h })
      },

      hidepanel: (panid) => {
        this.setPanelVisible(panid, false)
      },

      showpanel: (panid) => {
        this.setPanelVisible(panid, true)
      },

      askdir: async (reply, opts) => {
        try {
          const folder = await self.showDirectoryPicker(opts)
          await folder.requestPermission({ mode: 'readwrite' })
          reply([folder])
        }
        catch (e) {
          console.error(e)
          reply([null])
        }
      },

      thisfile: (file) => {
        this.file = file
        this.sys.updateLocation()
      },

      getprocs: (reply) => {
        reply([[...Process.all.values()].map(p => ({
          path: p.path,
          pid: p.id,
        }))])
      },

      readcliptext: async (reply) => {
        const text = await navigator.clipboard.readText()
        reply([text])
      },

      setdesktop: (x, y, w, h) => {
        this.sys.setDesktop(x, y, w, h)
      },

      cursorinit: (name, data) => {
        cursors[name] = Cursor.fromString(data)
      },

      cursor: (name) => {
        sys.useCursor(name)
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
    this.sys.panelevents.emit({
      type: 'toggled',
      id: panel.id,
      visible,
    })

    if (!visible && this.sys.focused === panel) {
      const idx = Panel.ordered.indexOf(panel)
      const nextInLine = Panel.ordered.slice(0, idx).toReversed().find(p => p.visible)
      if (nextInLine) this.sys.focusPanel(nextInLine)
    }

    this.sys.updateLocation()
    this.sys.redrawAllPanels()
  }

  focus(panel: Panel) {
    this.sys.focusPanel(panel)
  }

  terminate() {
    this.status = 'dead'
    Process.all.delete(this.id)
    clearInterval(this.heartbeat)
    this.worker.terminate()
    for (const panel of this.panels) {
      this.closePanel(panel)
    }
    this.procevents.emit({ type: 'ended', pid: this.id })
  }

  closePanel(panel: Panel) {
    this.sys.panelevents.emit({ type: 'closed', id: panel.id })
    panel.closePort()
    this.sys.removePanel(panel)
    this.panels.delete(panel)
  }

}
