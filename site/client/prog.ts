import { Panel } from "../client/panel.js"
import { progRPC } from "../shared/rpc.js"

class Program {

  rpc = progRPC(self)
  pid = 0

  async init() {
    this.rpc.send('init', [])
    const [id] = await this.rpc.once('init')
    this.pid = id
  }

  async makePanel() {
    this.rpc.send('newpanel', [])
    const [id, x, y, w, h] = await this.rpc.once('newpanel')
    return new Panel(this.rpc, id, x, y, w, h)
  }

}

export const prog = new Program()
await prog.init()
