import { setupCanvas } from './canvas.js'
const canvas = setupCanvas()

const sw = await navigator.serviceWorker.register('/sw.js', { type: 'classic', updateViaCache: 'none' })
await sw.update()
await navigator.serviceWorker.ready

const { Sys } = await import('./sys.js')
const sys = new Sys(canvas)

if (new URLSearchParams(location.search).has('code')) {
  sys.launch('run' + location.search, {}, [])
}
else {
  await sys.runShell()
  await sys.loadAppsFromUrl()
}

if (!canvas.embedded) {
  sys.focus()
}
