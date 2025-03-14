import { sysRPC } from './shared/rpc.js'
import { setupCanvas } from './util/canvas.js'

const { canvas, ctx } = setupCanvas()

class Panel {

  static map = new Map<number, Panel>()
  static id = 0
  id

  x = 0
  y = 0
  w = 100
  h = 100

  img?: ImageBitmap

  constructor(proc: Process) {
    Panel.map.set(this.id = ++Panel.id, this)
  }

}


function redrawAllPanels() {
  ctx.clearRect(0, 0, 320, 180)
  for (const panel of Panel.map.values()) {
    if (panel.img) {
      ctx.drawImage(panel.img, panel.x, panel.y)
    }
  }
  ctx.drawImage(cursor, mouse.x, mouse.y)
}

const cursor = new OffscreenCanvas(1, 1)
const cursorctx = cursor.getContext('2d')!
cursorctx.fillStyle = '#fff'
cursorctx.fillRect(0, 0, 1, 1)

class Process {

  static map = new Map<number, Process>()
  static id = 0
  id

  rpc

  constructor(path: string) {
    Process.map.set(this.id = ++Process.id, this)

    const absurl = new URL(path, import.meta.url)
    const worker = new Worker(absurl, { type: 'module' })

    this.rpc = sysRPC(worker)

    this.rpc.once('init').then(() => {
      this.rpc.send('init', [this.id])
    })

    this.rpc.listen('newpanel', () => {
      const p = new Panel(this)
      this.rpc.send('newpanel', [p.id, p.x, p.y, p.w, p.h])
    })

    this.rpc.listen('adjpanel', (id, x, y, w, h) => {
      const panel = Panel.map.get(id)!
      panel.x = x
      panel.y = y
      panel.w = w
      panel.h = h
    })

    this.rpc.listen('blitpanel', (id, img) => {
      const panel = Panel.map.get(id)!
      panel.img = img
      redrawAllPanels()
    })

  }

}

const proc1 = new Process('/apps/prog1.js')
// const proc2 = new Process('/apps/prog1.js')
// const proc3 = new Process('/apps/prog1.js')

const mouse = { x: 0, y: 0 }

canvas.onmousemove = (e) => {
  const x = Math.min(320 - 1, e.offsetX)
  const y = Math.min(180 - 1, e.offsetY)
  if (x === mouse.x && y === mouse.y) return
  mouse.x = x
  mouse.y = y
  redrawAllPanels()
}
