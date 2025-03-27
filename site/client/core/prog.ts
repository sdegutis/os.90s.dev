import { Panel } from "/client/core/panel.js"
import { $, Ref } from "/client/core/ref.js"
import { wRPC, type ClientProgram, type PanelOrdering, type ServerProgram } from "/client/core/rpc.js"
import type { Point, Size } from "/client/core/types.js"

class Program {

  private rpc = new wRPC<ClientProgram, ServerProgram>(self, {

    resized: (w, h) => {
      this.size = { w, h }
    },

    ping: (reply, n) => {
      reply([n % 2 === 0 ? n + 2 : n + 1], [])
    },

    keydown: (key) => {
      this.keymap.add(key)
      this.focusedPanel?.onKeyDown(key)
    },

    keyup: (key) => {
      this.keymap.delete(key)
      this.focusedPanel?.onKeyUp(key)
    },

  })

  pid = 0

  panels = new Set<Panel>()
  exitsOnLastPanelClose = true

  keymap = new Set<string>()

  $size: Ref<Size> = $({ w: 0, h: 0 })
  get size() { return this.$size.val }
  set size(s: Size) { this.$size.val = s }

  async init() {
    const [id, w, h, keymap] = await this.rpc.call('init', [])
    this.pid = id
    this.size = { w, h }

    keymap.forEach(k => this.keymap.add(k))
  }

  get focusedPanel() {
    return [...this.panels].find(p => p.isFocused)
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

    this.panels.add(panel)
    panel.didClose.watch(() => {
      this.panels.delete(panel)
      if (this.panels.size === 0 && this.exitsOnLastPanelClose) {
        this.terminate()
      }
    })

    return panel
  }

  terminate() {
    this.rpc.send('terminate', [])
    self.close()
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

  async mount(name: string) {
    await this.rpc.call('mount', [name])
  }

  async unmount(name: string) {
    await this.rpc.call('unmount', [name])
  }

  async launch(path: string) {
    return await this.rpc.call('launch', [path])
  }

}

export const program = new Program()
await program.init()
