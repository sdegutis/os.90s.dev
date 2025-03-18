import { wRPC, type ClientProgram, type PanelOrdering, type PanelPosition, type ServerProgram } from "../../shared/rpc.js"
import { Panel } from "./panel.js"

export class Program {

  private rpc = wRPC<ClientProgram, ServerProgram>(self)
  pid = 0

  panels = new Set<Panel>()
  exitsOnLastPanelClose = true

  width = 0
  height = 0

  async init() {
    this.rpc.send('init', [])
    const [id, w, h] = await this.rpc.once('init')
    this.pid = id
    this.width = w
    this.height = h

    this.rpc.listen('ping', (n) => {
      this.rpc.send('pong', [n % 2 === 0 ? n + 2 : n + 1])
    })
  }

  async makePanel(config: {
    order?: PanelOrdering,
    pos?: PanelPosition,
    size: [number, number],
    view: JSX.Element,
  }) {
    const order = config.order ?? 'normal'
    const { size: [w, h] } = config
    const [mx, my] = config.pos ?? [-1, -1]
    this.rpc.send('newpanel', [order, mx, my, w, h])
    const [id, x, y, port] = await this.rpc.once('newpanel')

    const panel = new Panel(port, id, x, y, w, h, config.view)

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

}
