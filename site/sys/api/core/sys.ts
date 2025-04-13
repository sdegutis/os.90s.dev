import { kvs } from "../util/kvs.js"
import { View } from "../views/view.js"
import { sysConfig } from "./config.js"
import { Font } from "./font.js"
import { Panel } from "./panel.js"
import { $, defRef, MaybeRef, Ref } from "./ref.js"
import { wRPC, type ClientProgram, type PanelOrdering, type ServerProgram } from "./rpc.js"
import type { Point, Size } from "./types.js"

class Program {

  pid = 0
  opts: Record<string, any> = {}

  panels = new Set<Panel>()
  exitsOnLastPanelClose = true

  get focusedPanel() {
    return [...this.panels].find(p => p.isFocused)
  }

  terminate() {
    sys.endproc(this.pid)
    self.close()
  }

  async becomeShell() {
    const isLocked = new Promise(r => setTimeout(() => r(1), 100))
    const isUnlocked = Promise.withResolvers<number>()

    navigator.locks.request('shell', async () => {
      isUnlocked.resolve(0)
      await new Promise(r => { })
    })

    const quit = new BroadcastChannel('shell')
    quit.onmessage = msg => { if (msg.data === sys.sysid) this.terminate() }

    await Promise.race([isUnlocked.promise, isLocked]).then(need => {
      if (need) quit.postMessage(sys.sysid)
    })
  }

}

export const program = new Program()

const panelnames = await kvs<Size>('panels')

class Sys {

  sysid!: string

  keyevents = new BroadcastChannel('keyevents')

  private rpc = new wRPC<ClientProgram, ServerProgram>(self, {

    ping: (reply, n) => {
      reply([n % 2 === 0 ? n + 2 : n + 1])
    },

  })

  keymap = new Set<string>()

  readonly $mouse: Ref<Point> = $({ x: 0, y: 0 })
  get mouse() { return this.$mouse.val }
  set mouse(p: Point) { this.$mouse.val = p }

  $font!: Ref<Font>
  get font() { return this.$font.val }
  set font(f: Font) { this.$font.val = f }

  $size: Ref<Size> = $({ w: 0, h: 0 })
  get size() { return this.$size.val }
  set size(s: Size) { this.$size.val = s }

  sysevents = new BroadcastChannel('sysevents')

  async init() {
    this.keyevents.onmessage = msg => {
      const [fn, key] = msg.data
      if (fn === 'keydown') {
        this.keymap.add(key)
        program.focusedPanel?.onKeyDown(key)
      }
      else if (fn === 'keyup') {
        this.keymap.delete(key)
        program.focusedPanel?.onKeyUp(key)
      }
    }

    const [sysid, id, w, h, keymap, opts] = await this.rpc.call('init', [])
    this.sysid = sysid
    program.opts = opts
    program.pid = id
    this.size = { w, h }

    this.sysevents.addEventListener('message', msg => {
      if (msg.data.type === 'resized') {
        const [w, h] = msg.data.size
        this.size = { w, h }
      }
    })

    keymap.forEach(k => this.keymap.add(k))

    this.$font = sysConfig.$font
  }

  async makePanel(config: {
    name: string,
    saveSize?: boolean,
    order?: PanelOrdering,
    pos?: MaybeRef<Point>,
    canFocus?: boolean,
  }, root: View) {
    if (config.name && config.saveSize !== false) {
      const size = await panelnames.get(config.name)
      if (size) { root.$size.val = size }
      root.$size.watch((size => panelnames.set(config.name!, size)))
    }

    const initpos = config.pos ? defRef(config.pos).val : undefined
    const [id, x, y, port] = await this.rpc.call('newpanel', [
      config.name,
      config.order ?? 'normal',
      initpos?.x ?? -1, initpos?.y ?? -1,
      root.size.w, root.size.h,
      config.canFocus ?? true
    ])

    const point = $({ x, y })
    if (config.pos instanceof Ref) point.defer(config.pos)

    const panel = new Panel(port, id, point, root)

    program.panels.add(panel)
    panel.didClose.watch(() => {
      program.panels.delete(panel)
      if (program.panels.size === 0 && program.exitsOnLastPanelClose) {
        program.terminate()
      }
    })

    return panel
  }

  async getprocs() {
    const [procs] = await this.rpc.call('getprocs', [])
    return procs
  }

  focusPanel(id: number) {
    this.rpc.send('focuspanel', [id])
  }

  endproc(pid: number) {
    this.rpc.send('terminate', [pid])
  }

  resize(w: number, h: number) {
    this.rpc.send('resize', [w, h])
  }

  noteCurrentFile(path: string) {
    this.rpc.send('thisfile', [path])
  }

  async launch(path: string, file?: string) {
    const [pid] = await this.rpc.call('launch', [path, { file }])
    return pid
  }

  async askdir(opts?: DirectoryPickerOptions) {
    const [dir] = await this.rpc.call('askdir', [opts])
    return dir
  }

  async readClipboardText() {
    const [text] = await this.rpc.call('readcliptext', [])
    return text
  }

  hidePanel(panid: number) {
    this.rpc.send('hidepanel', [panid])
  }

  showPanel(panid: number) {
    this.rpc.send('showpanel', [panid])
  }

}

export const sys = new Sys()
await sys.init()
