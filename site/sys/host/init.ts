import { sysConfig } from "../api/core/config.js"
import { Sys } from "./sys.js"

await navigator.serviceWorker.register('/sw.js', { type: 'classic', updateViaCache: 'none' })
await navigator.serviceWorker.ready

const sys = new Sys(sysConfig.$size)
sys.runShell()
sys.runStartupApps()
await sys.loadAppsFromUrl()


// new EventSource('/_reload').onmessage = () => location.reload()

// const code = `

// const stream1 = new Blob([code]).stream().pipeThrough(new CompressionStream('gzip'))
// const blob1 = await new Response(stream1).blob()
// const bytes1 = new Uint8Array(await blob1.arrayBuffer())
// const compressed = btoa(String.fromCharCode(...bytes1))
// console.log('hey', compressed)

// const out1 = atob(compressed)
// const out2 = new Uint8Array(Array(out1.length).keys().map(i => out1.charCodeAt(i)))
// const out3 = new Blob([out2]).stream().pipeThrough(new DecompressionStream('gzip'))
// const out4 = await new Response(out3).text()

// console.log(out4 === code)

// `

// const stream1 = new Blob([code]).stream().pipeThrough(new CompressionStream('gzip'))
// const blob1 = await new Response(stream1).blob()
// const bytes1 = new Uint8Array(await blob1.arrayBuffer())
// const compressed = btoa(String.fromCharCode(...bytes1))
// console.log('hey', compressed)

// const out1 = atob(compressed)
// const out2 = new Uint8Array(Array(out1.length).keys().map(i => out1.charCodeAt(i)))
// const out3 = new Blob([out2]).stream().pipeThrough(new DecompressionStream('gzip'))
// const out4 = await new Response(out3).text()

// console.log(out4 === code)

// console.log(code.length, compressed.length)
