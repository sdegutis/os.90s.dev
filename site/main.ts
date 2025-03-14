import { setupCanvas } from './core/sys.js'
import { sysRPC } from './shared/rpc.js'

const { canvas, ctx } = setupCanvas()

class Panel {

  id

  x = 0
  y = 0
  w = 100
  h = 100

  img?: ImageBitmap

  constructor(proc: Process) {
    this.id = panels.add(this)
  }

}


class EternalList<T> {

  map = new Map<number, T>()
  id = 0

  add(t: T) {
    const id = ++this.id
    this.map.set(id, t)
    return id
  }

}

const processes = new EternalList<Process>()
const panels = new EternalList<Panel>()

function redrawAllPanels() {
  for (const panel of panels.map.values()) {
    if (panel.img) {
      ctx.drawImage(panel.img, panel.x, panel.y)
    }
  }
}

class Process {

  id: number
  rpc

  constructor(path: string) {
    this.id = processes.add(this)

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
      const panel = panels.map.get(id)!
      panel.x = x
      panel.y = y
      panel.w = w
      panel.h = h
    })

    this.rpc.listen('blitpanel', (id, img) => {
      const panel = panels.map.get(id)!
      panel.img = img
      redrawAllPanels()
    })

  }

}

const proc1 = new Process('/apps/prog1.js')
// const proc2 = new Process('/apps/prog1.js')
// const proc3 = new Process('/apps/prog1.js')
