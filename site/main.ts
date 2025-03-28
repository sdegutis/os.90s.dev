import { Sys } from "./server/core/sys.js"

await navigator.serviceWorker.register('/sw.js', { type: 'module', updateViaCache: 'none' })
await navigator.serviceWorker.ready

new Sys(320, 180)
