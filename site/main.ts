import { setupCanvas } from './core/sys.js'
import { sysRPC } from './shared/rpc.js'

const { canvas, ctx } = setupCanvas()

class Panel {

  id

  constructor(proc: Process) {
    this.id = panels.add(this)
  }

  x = 0
  y = 0
  w = 0
  h = 0
}

class EternalList<T> {

  list: T[] = []
  id = 0

  add(t: T) {
    this.list.push(t)
    return ++this.id
  }

}

const processes = new EternalList<Process>()
const panels = new EternalList<Panel>()

class Process {

  id: number
  rpc

  constructor(path: string) {
    this.id = processes.add(this)

    const absurl = new URL(path, import.meta.url)
    const worker = new Worker(absurl, { type: 'module' })

    this.rpc = sysRPC(worker)
    this.rpc.send('init', [this.id])

    this.rpc.listen('newpanel', () => {
      const p = new Panel(this)
      this.rpc.send('panel', [p.id, p.x, p.y, p.w, p.h])
    })


  }

}

const proc1 = new Process('/apps/prog1.js')
const proc2 = new Process('/apps/prog1.js')
const proc3 = new Process('/apps/prog1.js')


