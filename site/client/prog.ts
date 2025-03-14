import { Panel } from "../client/panel.js"
import { wRPC, type ClientProg, type PanelPos, type ServerSys } from "../shared/rpc.js"

export class Program {

  private rpc = wRPC<ClientProg, ServerSys>(self)
  pid = 0

  panels = new Set<Panel>()
  exitsOnLastPanelClose = true

  async init() {
    this.rpc.send('init', [])
    const [id] = await this.rpc.once('init')
    this.pid = id
  }

  async makePanel(pos: PanelPos) {
    this.rpc.send('newpanel', [pos])
    const [id, x, y, w, h, port] = await this.rpc.once('newpanel')
    const p = new Panel(port, id, x, y, w, h)
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
