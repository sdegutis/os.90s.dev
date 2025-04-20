import { sysConfig } from "../api/core/config.js"
import { Sys } from "./sys.js"

await navigator.serviceWorker.register('/sw.js', { type: 'classic', updateViaCache: 'none' })
await navigator.serviceWorker.ready

const params = new URLSearchParams(location.search)

if (params.has('embed')) {
  const sys = new Sys({ w: window.innerWidth, h: window.innerHeight })
  sys.launch('run' + location.search, {})

  const resizeParent = () => {
    const { w, h } = sys.size
    parent.postMessage({ resized: { w, h } }, '*')
  }

  resizeParent()
  sys.$size.watch(resizeParent)
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
