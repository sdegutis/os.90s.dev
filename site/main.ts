import { Sys } from "/server/core/sys.js"

await navigator.serviceWorker.register('/sw.js', { type: 'module', updateViaCache: 'none' })
await navigator.serviceWorker.ready

await Sys.init(320, 180)
