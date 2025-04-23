import { View } from "../views/view.js"
import { BC, KeyEvent, SysEvent } from "./bc.js"
import { sysConfig } from "./config.js"
import { Font } from "./font.js"
import { Listener } from "./listener.js"
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

    type ShellEvent = { type: 'newshell' }
    const quit = new BC<ShellEvent>('shell', sys.sysid)
    quit.handle(msg => this.terminate())

    await Promise.race([isUnlocked.promise, isLocked]).then(need => {
      if (need) quit.emit({ type: 'newshell' })
    })
  }

}

export const program = new Program()

class Sys {

  sysid!: string

  keyevents!: BC<KeyEvent>

  private rpc = new wRPC<ClientProgram, ServerProgram>(self, {

    ping: (reply, n) => {
      reply([n % 2 === 0 ? n + 2 : n + 1])
    },

    gotipc: (port) => {
      this.onIpc.dispatch(port)
    },

  })

  pressedKeys = new Set<string>()

  onKeyPress = new Listener<string>()

  readonly $mouse: Ref<Point> = $({ x: 0, y: 0 })
  get mouse() { return this.$mouse.$ }
  set mouse(p: Point) { this.$mouse.$ = p }

  $font!: Ref<Font>
  get font() { return this.$font.$ }
  set font(f: Font) { this.$font.$ = f }

  $size: Ref<Size> = $({ w: 0, h: 0 })
  get size() { return this.$size.$ }
  set size(s: Size) { this.$size.$ = s }

  desktop!: Point & Size

  sysevents!: BC<SysEvent>

  onIpc = new Listener<MessagePort>()

  async init() {
    const [sysid, id, w, h, desktop, keymap, opts] = await this.rpc.call('init', [])
    this.sysid = sysid
    this.size = { w, h }
    this.desktop = desktop
    program.opts = opts
    program.pid = id

    this.keyevents = new BC<KeyEvent>('keyevents', sysid)
    this.keyevents.handle(msg => {
      if (msg.type === 'keydown') {
        this.pressedKeys.add(msg.key)
        program.focusedPanel?.onKeyDown(msg.key)
        this.handleKeyPress(msg.key)
      }
      else if (msg.type === 'keyup') {
        this.pressedKeys.delete(msg.key)
        program.focusedPanel?.onKeyUp(msg.key)
      }
    })

    this.sysevents = new BC<SysEvent>('sysevents', sysid)


    this.$size.equals = sizeEquals

    this.sysevents.handle(data => {
      if (data.type === 'resized') {
        const [w, h] = data.size
        this.size = { w, h }
      }
      else if (data.type === 'desktop') {
        this.desktop = data.desktop
      }
    })

    keymap.forEach(k => this.pressedKeys.add(k))

    this.$font = sysConfig.$font
  }

  #ctrlKeys = new Set(['Control', 'Alt', 'Shift'])

  private handleKeyPress(key: string) {
    if (this.#ctrlKeys.has(key)) return

    const keys = []
    if (sys.pressedKeys.has('Control')) keys.push('ctrl')
    if (sys.pressedKeys.has('Alt')) keys.push('alt')
    if (sys.pressedKeys.has('Shift') && key.length > 1 && key !== key.toLowerCase()) {
      keys.push('shift')
    }

    key = key.replace(/^Arrow/, '')
    if (key.length > 1) key = key.toLowerCase()
    keys.push(key)
    const finalkey = keys.join(' ')

    this.onKeyPress.dispatch(finalkey)
  }

  async makePanel(config: {
    name: string,
    order?: PanelOrdering,
    constrainToDesktop?: boolean,
  }, root: View) {
    const [id, port] = await this.rpc.call('newpanel', [
      config.name,
      config.order ?? 'normal',
      root.point.x, root.point.y,
      root.size.w, root.size.h,
    ])

    const constrainToDesktop = config.constrainToDesktop ?? true

    const panel = new Panel(port, id, root, config.name, constrainToDesktop)

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

  async openIpc(pid: number) {
    const [port] = await this.rpc.call('openipc', [pid])
    return port
  }

  async launch(path: string, file?: string, opts?: Record<string, any>, optsTs?: Transferable[]) {
    const ts = optsTs ?? []
    const [pid] = await this.rpc.call('launch', [path, { file, ...opts }, ts], ts)
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
