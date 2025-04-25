import { sysConfig } from "../api/core/config.js"
import { $ } from "../api/core/ref.js"
import { Size } from "../api/core/types.js"
import { debounce } from "../api/util/throttle.js"
import { setupCanvas } from "./canvas.js"
import { Sys } from "./sys.js"

const sw = await navigator.serviceWorker.register('/sw.js', { type: 'classic', updateViaCache: 'none' })
await sw.update()
await navigator.serviceWorker.ready

const $size = size()
const sys = new Sys(setupCanvas($size), $size)

const params = new URLSearchParams(location.search)
if (params.has('embed')) {
  sys.launch('run' + location.search, {}, [])
}
else {
  await sys.runShell()
  await sys.loadAppsFromUrl()
  sys.focus()
}

function size() {
  if (window.top === window.self) return sysConfig.$size
  const currentSize = (): Size => ({ w: window.innerWidth / 2, h: window.innerHeight / 2 })
  const $size = $(currentSize())
  new ResizeObserver(debounce(() => { $size.$ = currentSize() })).observe(document.body)
  return $size
}
