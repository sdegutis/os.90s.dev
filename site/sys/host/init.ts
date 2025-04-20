import { sysConfig } from "../api/core/config.js"
import { Sys } from "./sys.js"

await navigator.serviceWorker.register('/sw.js', { type: 'classic', updateViaCache: 'none' })
await navigator.serviceWorker.ready

const params = new URLSearchParams(location.search)

if (params.has('embed')) {
  const w = +(params.get('w') ?? 100)
  const h = +(params.get('h') ?? 100)
  const sys = new Sys({ w, h })
  await sys.launch(`run` + location.search, {})
}
else {
  const sys = new Sys(sysConfig.$size)
  sys.runShell()
  sys.runStartupApps()
  await sys.loadAppsFromUrl()
  sys.focus()
}
