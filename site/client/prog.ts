import { Panel } from "../client/panel.js"
import { wRPC, type ClientProg, type PanelPos, type ServerSys } from "../shared/rpc.js"

class Program {

  rpc = wRPC<ClientProg, ServerSys>(self)
  pid = 0

  async init() {
    this.rpc.send('init', [])
    const [id] = await this.rpc.once('init')
    this.pid = id
  }

  async makePanel(pos: PanelPos) {
    this.rpc.send('newpanel', [pos])
    const [id, x, y, w, h, port] = await this.rpc.once('newpanel')
    return new Panel(port, id, x, y, w, h)
  }

}

export const prog = new Program()
await prog.init()
