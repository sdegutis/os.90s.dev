import { handleRoute } from "./sys/sw/router.js"

self.addEventListener('install', (e) => {
  e.addRoutes({
    condition: { runningStatus: 'running' },
    source: 'fetch-event',
  })
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith(location.origin)) {
    e.respondWith(fetch(e.request))
    return
  }

  const url = new URL(e.request.url)
  if (url.pathname.startsWith('/fs/')) {
    e.respondWith(handleRoute(url, e.request))
  }
  else {
    e.respondWith(fetch(e.request))
  }
})
