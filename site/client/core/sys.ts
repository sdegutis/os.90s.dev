import { fs } from "../fs/fs.js"
import { View } from "../views/view.js"
import { Font } from "./font.js"
import { Listener } from "./listener.js"
import { Panel } from "./panel.js"
import { $, Ref } from "./ref.js"
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

}

export const program = new Program()

class Sys {

  private rpc = new wRPC<ClientProgram, ServerProgram>(self, {

    resized: (w, h) => {
      this.size = { w, h }
    },

    ping: (reply, n) => {
      reply([n % 2 === 0 ? n + 2 : n + 1])
    },

    keydown: (key) => {
      this.keymap.add(key)
      program.focusedPanel?.onKeyDown(key)
    },

    keyup: (key) => {
      this.keymap.delete(key)
      program.focusedPanel?.onKeyUp(key)
    },

    procbegan: (pid) => {
      this.procbegan.dispatch(pid)
    },

    procended: (pid) => {
      this.procended.dispatch(pid)
    },

    gotipc: (port) => {
      this.ipcopened.dispatch(port)
    },

  })

  procbegan = new Listener<number>()
  procended = new Listener<number>()
  ipcopened = new Listener<MessagePort>()

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

  async init() {
    const [id, w, h, keymap, fontstr, opts, syncfs] = await this.rpc.call('init', [])
    await fs.init(syncfs, id)
    program.opts = opts
    program.pid = id
    this.size = { w, h }
    this.$font = $(new Font(fontstr))
    keymap.forEach(k => this.keymap.add(k))
  }

  async makePanel(config: {
    order?: PanelOrdering,
    pos?: Ref<Point> | 'default' | 'center',
    view: View,
  }) {
    const order = config.order ?? 'normal'
    const point = (!config.pos || config.pos === 'default') ? $({ x: -1, y: -1 }) :
      config.pos === 'center' ? $({ x: -2, y: -2 }) :
        config.pos

    const root = config.view
    const { w, h } = root.size

    const [id, x, y, port] = await this.rpc.call('newpanel', [order, point.val.x, point.val.y, w, h])

    point.val = { x, y }
    const panel = new Panel(this.keymap, port, id, point, root)

    program.panels.add(panel)
    panel.didClose.watch(() => {
      program.panels.delete(panel)
      if (program.panels.size === 0 && program.exitsOnLastPanelClose) {
        program.terminate()
      }
    })

    return panel
  }

  async watchprocs() {
    await this.rpc.call('watchprocs', [])
  }

  endproc(pid: number) {
    this.rpc.send('terminate', [pid])
  }

  resize(w: number, h: number) {
    this.rpc.send('resize', [w, h])
  }

  async launch(path: string, file?: string) {
    const [pid] = await this.rpc.call('launch', [path, { file }])
    return pid
  }

  async openipc(pid: number) {
    const [port] = await this.rpc.call('openipc', [pid])
    return port
  }

  async askdir() {
    const [dir] = await this.rpc.call('askdir', [])
    return dir
  }

}

export const sys = new Sys()
await sys.init()
