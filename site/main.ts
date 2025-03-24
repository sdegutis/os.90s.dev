import { Process } from './server/process.js'
import { Sys } from './server/sys.js'

const sys = new Sys(320 * 2, 180 * 2)

const shell = new Process(sys, '/apps/shell.js')
const proc1 = new Process(sys, '/apps/prog1.js')
