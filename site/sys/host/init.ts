import { Sys } from "./sys.js"

await navigator.serviceWorker.register('/sw.js', { type: 'module', updateViaCache: 'none' })
await navigator.serviceWorker.ready

await Sys.init(320, 180)
