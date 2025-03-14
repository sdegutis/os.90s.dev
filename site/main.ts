import { setupCanvas } from './core/sys.js'
import { sysRPC } from './shared/rpc.js'

const { canvas, ctx } = setupCanvas()

// class Panel {
//   x = 0
//   y = 0
//   w = 0
//   h = 0
// }

class EternalList<T> {

  list: T[] = []
  id = 0

  add(t: T) {
    this.list.push(t)
    return ++this.id
  }

}

const processes = new EternalList<Process>()

class Process {

  id: number
  rpc

  constructor(path: string) {
    this.id = processes.add(this)

    const absurl = new URL(path, import.meta.url)
    const worker = new Worker(absurl, { type: 'module' })

    this.rpc = sysRPC(worker)

    this.rpc.listen('newpanel', () => {
      this.rpc.send('panel', [1, 2, 3, 4, 5])
    })

    this.rpc.send('init', [this.id])


  }

}

const proc1 = new Process('/apps/prog1.js')
const proc2 = new Process('/apps/prog1.js')
const proc3 = new Process('/apps/prog1.js')


