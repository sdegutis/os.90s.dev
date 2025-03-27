import { sys } from "../../client/core/sys.js"
import { exec } from "/swc/vm.js"

const path = sys.opts["app"]
if (!path) throw new Error(`Can't exec path`)

const file = await sys.getfile(path)
if (!file) throw new Error('no such app file: ' + path)

exec(file)
