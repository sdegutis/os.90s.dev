import { $, type Ref } from "../../shared/ref.js"
import { wRPC, type ClientProgram, type PanelOrdering, type ServerProgram } from "../../shared/rpc.js"
import type { Point, Size } from "../util/types.js"
import { Panel } from "./panel.js"

export class Program {

  private rpc = wRPC<ClientProgram, ServerProgram>(self)
  pid = 0

  panels = new Set<Panel>()
  exitsOnLastPanelClose = true

  keymap = new Set<string>()

  $size: Ref<Size> = $({ w: 0, h: 0 })
  get size() { return this.$size.val }
  set size(s: Size) { this.$size.val = s }

  async init() {
    this.rpc.send('init', [])
    const [id, w, h, keymap] = await this.rpc.once('init')
    this.pid = id
    this.size = { w, h }

    keymap.forEach(k => this.keymap.add(k))

    this.rpc.listen('resized', (w, h) => {
      this.size = { w, h }
    })

    this.rpc.listen('keydown', (key) => {
      this.keymap.add(key)
      this.focusedPanel?.onKeyDown(key)
    })

    this.rpc.listen('keyup', (key) => {
      this.keymap.delete(key)
      this.focusedPanel?.onKeyUp(key)
    })

    this.rpc.listen('ping', (n) => {
      this.rpc.send('pong', [n % 2 === 0 ? n + 2 : n + 1])
    })
  }

  get focusedPanel() {
    return [...this.panels].find(p => p.isFocused)
  }

  async makePanel(config: {
    order?: PanelOrdering,
    pos?: Ref<Point> | 'default' | 'center',
    size: Ref<Size>,
    view: JSX.Element,
  }) {
    const order = config.order ?? 'normal'
    const point = (!config.pos || config.pos === 'default') ? $({ x: -1, y: -1 }) :
      config.pos === 'center' ? $({ x: -2, y: -2 }) :
        config.pos

    this.rpc.send('newpanel', [order, point.val.x, point.val.y, config.size.val.w, config.size.val.h])
    const [id, x, y, port] = await this.rpc.once('newpanel')

    point.val = { x, y }
    const panel = new Panel(this.keymap, port, id, point, config.size, config.view)

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

}

export const program = new Program()
await program.init()
