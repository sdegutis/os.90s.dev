import { Panel } from "../client/panel.js"
import { wRPC, type PanelPos, type ToProg, type ToSys } from "../shared/rpc.js"

class Program {

  rpc = wRPC<ToProg, ToSys>(self)
  pid = 0

  async init() {
    this.rpc.send('init', [])
    const [id] = await this.rpc.once('init')
    this.pid = id

    this.rpc.listen('focus', id => {
      Panel.map.get(id)?.onFocus()
    })

    this.rpc.listen('mouseentered', (id) => {
      Panel.map.get(id)?.onMouseEntered()
    })

    this.rpc.listen('mouseexited', (id) => {
      Panel.map.get(id)?.onMouseExited()
    })

    this.rpc.listen('mousemoved', (id, x, y) => {
      Panel.map.get(id)?.onMouseMoved(x, y)
    })

    this.rpc.listen('mousedown', (id, b) => {
      Panel.map.get(id)?.onMouseDown(b)
    })

    this.rpc.listen('mouseup', (id) => {
      Panel.map.get(id)?.onMouseUp()
    })

    this.rpc.listen('blur', id => {
      Panel.map.get(id)?.onBlur()
    })
  }

  async makePanel(pos: PanelPos) {
    this.rpc.send('newpanel', [pos])
    const [id, x, y, w, h] = await this.rpc.once('newpanel')
    return new Panel(this.rpc, id, x, y, w, h)
  }

}

export const prog = new Program()
await prog.init()
