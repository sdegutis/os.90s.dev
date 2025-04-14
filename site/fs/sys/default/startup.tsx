import * as api from "/api.js"
await api.appReady

console.log('hey')

api.program.terminate()
