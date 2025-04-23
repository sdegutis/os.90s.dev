import { sysConfig } from "../api/core/config.js"
import { Sys } from "./sys.js"

await Sys.installServiceWorker()

const params = new URLSearchParams(location.search)

if (params.has('embed')) {
  const sys = new Sys({ w: window.innerWidth / 2, h: window.innerHeight / 2 })
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
