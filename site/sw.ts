declare var __wbg_init: () => Promise<void>
declare var transformSync: typeof import('@swc/wasm-web').transformSync
declare var opendb: typeof import('./sys/api/util/db.js').opendb
declare var NETHOST: typeof import('./sys/api/core/nethost.js').NETHOST

importScripts('./sys/sw/wasm.js')
importScripts('./sys/sw/db.js')
importScripts('./sys/sw/nethost.js')

const ready = __wbg_init()
const usrdb = opendb<{ path: string, content?: string }>('usr', 'path')

async function compile(url: URL, tsx: string) {
  await ready
  const transformed = transformSync(tsx, {
    sourceMaps: 'inline',
    minify: true,
    filename: url.pathname,
    isModule: true,
    jsc: {
      externalHelpers: false,
      target: 'es2022',
      parser: { syntax: 'typescript', tsx: true },
      transform: {
        react: {
          runtime: 'automatic',
          importSource: '/FAKEIMPORT',
        },
      }
    }
  }).code
  return transformed.replace('/FAKEIMPORT/jsx-runtime', '/sys/api/jsx.js')
}


self.addEventListener('install', (e) => {
  // console.log('install', e)
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  // console.log('activate', e)
  self.clients.claim()
})

self.addEventListener('fetch', (e: FetchEvent) => {
  // console.log('fetch', e)
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



const jsHeaders = {
  headers: {
    "content-type": "application/javascript; charset=utf-8"
  }
}

async function jsResponse(url: URL, text: string) {
  const compiled = await compile(url, text)
  return new Response(compiled, jsHeaders)
}

async function handleRoute(url: URL, req: Request) {
  if (url.pathname.startsWith('/fs/sys/')) {
    if (url.pathname.endsWith('.js')) {
      let text = await fetch(req).then(r => r.text())
      return await jsResponse(url, text)
    }
    return fetch(req)
  }

  if (url.pathname.startsWith('/fs/usr/')) {
    const key = url.pathname.slice('/fs/usr/'.length)
    const fs = await usrdb
    const res = await fs.get(key)
    if (res === undefined) return new Response('', { status: 404 })
    return await jsResponse(url, res.content!)
  }

  if (url.pathname.startsWith('/fs/net/')) {
    const path = url.pathname.slice('/fs/usr/'.length)
    const r = await fetch(`${NETHOST}/fs/${path}`)
    const text = await r.text()

    if (path.endsWith('.js')) {
      return await jsResponse(url, text)
    }

    const contentType = r.headers.get('content-type')!
    return new Response(text, { headers: { 'content-type': contentType } })
  }

  return new Response('TEST')
}
