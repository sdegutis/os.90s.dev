import { Sys } from "./server/core/sys.js"

await installSw()

new Sys(320, 180)

async function installSw() {
  navigator.serviceWorker.register('/sw.js', {
    type: 'module',
    updateViaCache: 'none',
  })
  if (!navigator.serviceWorker.controller) {
    const p = Promise.withResolvers<void>()
    navigator.serviceWorker.addEventListener('controllerchange', () => p.resolve())
    await p.promise
  }
  await navigator.serviceWorker.ready
  return navigator.serviceWorker.controller!
}
