import { sysConfig } from "../api/core/config.js"
import { $ } from "../api/core/ref.js"
import { Size } from "../api/core/types.js"
import { debounce } from "../api/util/throttle.js"
import { setupCanvas } from "./canvas.js"
import { Sys } from "./sys.js"

const reg = await navigator.serviceWorker.register('/sw.js', { type: 'classic', updateViaCache: 'none' })
await reg.update()
await navigator.serviceWorker.ready

const params = new URLSearchParams(location.search)

if (params.has('embed')) {
  const currentSize = (): Size => ({ w: window.innerWidth / 2, h: window.innerHeight / 2 })
  const $size = $(currentSize())
  new ResizeObserver(debounce(() => { $size.$ = currentSize() })).observe(document.body)

  const sys = new Sys(setupCanvas($size), $size)
  sys.launch('run' + location.search, {}, [])
}
else {
  const sys = new Sys(setupCanvas(sysConfig.$size), sysConfig.$size)
  await sys.runShell()
  await sys.runStartupApps()
  await sys.loadAppsFromUrl()
  sys.focus()
}
