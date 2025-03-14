import { wRPC, type ClientProgram, type PanelOrdering, type ServerProgram } from "../../shared/rpc.js"
import type { View } from "../views/view.js"
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
  }

  async makePanel(data: {
    order: PanelOrdering,
    size: [number, number],
    view: View,
  }) {
    const { order, size: [w, h], view } = data
    this.rpc.send('newpanel', [order, w, h])
    const [id, x, y, port] = await this.rpc.once('newpanel')

    const p = new Panel(port, id, x, y, w, h, view)

    this.panels.add(p)
    p.didClose.watch(() => {
      this.panels.delete(p)
      if (this.panels.size === 0 && this.exitsOnLastPanelClose) {
        this.terminate()
      }
    })

    return p
  }

  terminate() {
    this.rpc.send('terminate', [])
    self.close()
  }

}
