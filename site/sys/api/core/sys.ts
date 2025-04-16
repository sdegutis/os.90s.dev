import { View } from "../views/view.js"
import { sysConfig } from "./config.js"
import { Font } from "./font.js"
import { Panel } from "./panel.js"
import { $, Ref } from "./ref.js"
import { wRPC, type ClientProgram, type PanelOrdering, type ServerProgram } from "./rpc.js"
import { sizeEquals, type Point, type Size } from "./types.js"

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

class Sys {

  sysid!: string

  keyevents = new BroadcastChannel('keyevents')

  private rpc = new wRPC<ClientProgram, ServerProgram>(self, {

    ping: (reply, n) => {
      reply([n % 2 === 0 ? n + 2 : n + 1])
    },

  })

  pressedKeys = new Set<string>()

  readonly $mouse: Ref<Point> = $({ x: 0, y: 0 })
  get mouse() { return this.$mouse.val }
  set mouse(p: Point) { this.$mouse.val = p }

  $font!: Ref<Font>
  get font() { return this.$font.val }
  set font(f: Font) { this.$font.val = f }

  $size: Ref<Size> = $({ w: 0, h: 0 })
  get size() { return this.$size.val }
  set size(s: Size) { this.$size.val = s }

  desktop!: Point & Size

  sysevents = new BroadcastChannel('sysevents')

  async init() {
    this.keyevents.onmessage = msg => {
      const [fn, key] = msg.data
      if (fn === 'keydown') {
        this.pressedKeys.add(key)
        program.focusedPanel?.onKeyDown(key)
      }
      else if (fn === 'keyup') {
        this.pressedKeys.delete(key)
        program.focusedPanel?.onKeyUp(key)
      }
    }

    const [sysid, id, w, h, desktop, keymap, opts] = await this.rpc.call('init', [])
    this.sysid = sysid
    this.size = { w, h }
    this.desktop = desktop
    program.opts = opts
    program.pid = id

    this.$size.equals = sizeEquals

    this.sysevents.addEventListener('message', msg => {
      if (msg.data.type === 'resized') {
        const [w, h] = msg.data.size
        this.size = { w, h }
      }
      else if (msg.data.type === 'desktop') {
        this.desktop = msg.data.desktop
      }
    })

    keymap.forEach(k => this.pressedKeys.add(k))

    this.$font = sysConfig.$font
  }

  async makePanel(config: {
    name: string,
    order?: PanelOrdering,
  }, root: View) {
    const [id, port] = await this.rpc.call('newpanel', [
      config.name,
      config.order ?? 'normal',
      root.point.x, root.point.y,
      root.size.w, root.size.h,
    ])

    const panel = new Panel(port, id, root, config.name)

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

  async getPanels() {
    const [panels] = await this.rpc.call('getpanels', [])
    return panels
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

  adjustPanel(panid: number, x: number, y: number, w: number, h: number) {
    this.rpc.send('adjust', [panid, x, y, w, h])
  }

  hidePanel(panid: number) {
    this.rpc.send('hidepanel', [panid])
  }

  showPanel(panid: number) {
    this.rpc.send('showpanel', [panid])
  }

  setWorkspaceArea(point: Point, size: Size) {
    this.rpc.send('setdesktop', [point.x, point.y, size.w, size.h])
  }

}

export const sys = new Sys()
await sys.init()
