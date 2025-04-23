import { sysConfig } from "../api/core/config.js"
import { $ } from "../api/core/ref.js"
import { Size } from "../api/core/types.js"
import { debounce } from "../api/util/throttle.js"
import { Sys } from "./sys.js"

await Sys.installServiceWorker()

const params = new URLSearchParams(location.search)

if (params.has('embed')) {
  const currentSize = (): Size => ({ w: window.innerWidth / 2, h: window.innerHeight / 2 })
  const $size = $(currentSize())
  new ResizeObserver(debounce(() => { $size.$ = currentSize() })).observe(document.body)

  const sys = new Sys($size)
  sys.launch('run' + location.search, {}, [])
}
else {
  const sys = new Sys(sysConfig.$size)
  sys.initialize([
    sys.runShell(),
    sys.runStartupApps(),
    sys.loadAppsFromUrl(),
    Promise.resolve(sys.focus()),
  ])
}
