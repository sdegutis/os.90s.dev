import { Process } from './server/process.js'
import { Sys } from './server/sys.js'

const sys = new Sys()

const proc1 = new Process(sys, '/apps/prog1.js')
// const proc2 = new Process('/apps/prog1.js')
// const proc3 = new Process('/apps/prog1.js')
