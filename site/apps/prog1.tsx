import { progRPC } from "../shared/rpc.js"

type Rpc = ReturnType<typeof progRPC>

class PanelProxy {

  rpc
  id
  x
  y
  w
  h

  constructor(rpc: Rpc, id: number, x: number, y: number, w: number, h: number) {
    this.rpc = rpc
    this.id = id
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  move(x: number, y: number) {
    this.x = x
    this.y = y
    rpc.send('adjpanel', [this.id, this.x, this.y, this.w, this.h])
  }

  resize(w: number, h: number) {
    this.w = w
    this.h = h
    rpc.send('adjpanel', [this.id, this.x, this.y, this.w, this.h])
  }

  blit() {
    const canvas = new OffscreenCanvas(this.w, this.h)
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#900'
    ctx.fillRect(0, 0, this.w, this.h)
    const bmp = canvas.transferToImageBitmap()
    rpc.send('blitpanel', [this.id, bmp], [bmp])
  }

}

const panels = new Map<number, PanelProxy>()

const rpc = progRPC(self)

rpc.send('init', [])
const [id] = await rpc.once('init')

async function makePanel() {
  rpc.send('newpanel', [])
  const [id, x, y, w, h] = await rpc.once('newpanel')
  const panel = new PanelProxy(rpc, id, x, y, w, h)
  panels.set(id, panel)
  return panel
}

if (id === 1) {
  const panel = await makePanel()
  panel.blit()
}
