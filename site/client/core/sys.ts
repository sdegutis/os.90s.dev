import { Font } from "/client/core/font.js"
import { Panel } from "/client/core/panel.js"
import { $, Ref } from "/client/core/ref.js"
import { wRPC, type ClientProgram, type PanelOrdering, type ServerProgram } from "/client/core/rpc.js"
import type { Point, Size } from "/client/core/types.js"

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
      reply([n % 2 === 0 ? n + 2 : n + 1], [])
    },

    keydown: (key) => {
      this.keymap.add(key)
      program.focusedPanel?.onKeyDown(key)
    },

    keyup: (key) => {
      this.keymap.delete(key)
      program.focusedPanel?.onKeyUp(key)
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

  async init() {
    program.opts = JSON.parse(new URLSearchParams(location.search).get('opts') ?? '{}')

    const [id, w, h, keymap, fontstr] = await this.rpc.call('init', [])
    program.pid = id
    this.size = { w, h }
    this.$font = $(new Font(fontstr))

    keymap.forEach(k => this.keymap.add(k))
  }

  async makePanel(config: {
    order?: PanelOrdering,
    pos?: Ref<Point> | 'default' | 'center',
    view: JSX.Element,
  }) {
    const order = config.order ?? 'normal'
    const point = (!config.pos || config.pos === 'default') ? $({ x: -1, y: -1 }) :
      config.pos === 'center' ? $({ x: -2, y: -2 }) :
        config.pos

    const root = config.view

    const [id, x, y, port] = await this.rpc.call('newpanel', [order, point.val.x, point.val.y, root.size.w, root.size.h])

    point.val = { x, y }
    const panel = new Panel(this.keymap, port, id, point, root.$.size, config.view)

    program.panels.add(panel)
    panel.didClose.watch(() => {
      program.panels.delete(panel)
      if (program.panels.size === 0 && program.exitsOnLastPanelClose) {
        program.terminate()
      }
    })

    return panel
  }

  endproc(pid: number) {
    this.rpc.send('terminate', [pid])
  }

  resize(w: number, h: number) {
    this.rpc.send('resize', [w, h])
  }

  async listdrives(path: string) {
    return await this.rpc.call('listdrives', [])
  }

  async listdir(path: string) {
    return await this.rpc.call('listdir', [path])
  }

  async getfile(path: string) {
    const [contents] = await this.rpc.call('getfile', [path])
    return contents
  }

  async putfile(path: string, content: string) {
    await this.rpc.call('putfile', [path, content])
  }

  async mount(name: string) {
    await this.rpc.call('mount', [name])
  }

  async unmount(name: string) {
    await this.rpc.call('unmount', [name])
  }

  async launch(path: string, file?: string) {
    const [pid] = await this.rpc.call('launch', [path, { file }])
    return pid
  }

}

export const sys = new Sys()
await sys.init()
