import { Sys } from "./server/core/sys.js"

const sys = new Sys(320 * 1, 180 * 1)

sys.launch('/apps/shell.js')
sys.launch('/apps/filer.js')
