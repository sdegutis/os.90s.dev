import { program } from "/client/core/prog.js"

const url = new URLSearchParams(location.search)
const app = url.get('app')
if (!app) throw new Error(`Can't exec path`)
await program.init(app)
