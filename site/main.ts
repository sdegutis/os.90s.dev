import { Process } from './server/process.js'
import { Sys } from './server/sys.js'

const sys = new Sys(320, 180)

const shell = new Process(sys, '/apps/shell.js'); await sleep(.01)
const proc2 = new Process(sys, '/apps/prog2.js'); await sleep(.01)
const proc3 = new Process(sys, '/apps/prog3.js'); await sleep(.01)
const proc1 = new Process(sys, '/apps/prog1.js'); await sleep(.01)

function sleep(s: number) {
  return new Promise(r => setTimeout(r, s * 1000))
}
