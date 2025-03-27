import { program } from "/client/core/prog.js"
import { exec } from "/swc/vm.js"

const path = new URLSearchParams(location.search).get('app')
if (!path) throw new Error(`Can't exec path`)

const file = await program.getfile(path)
if (!file) throw new Error('no such app file: ' + path)

exec(file)
