import { Process } from './server/process.js'
import { Sys } from './server/sys.js'

const sys = new Sys(320, 180)

const shell = new Process(sys, '/apps/shell.js')

const proc1 = new Process(sys, '/apps/prog1.js')
const proc2 = new Process(sys, '/apps/prog2.js')
const proc3 = new Process(sys, '/apps/prog3.js')

// setTimeout(() => {
//   proc2.terminate()
// }, 1000)
