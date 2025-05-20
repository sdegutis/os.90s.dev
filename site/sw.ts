declare var __wbg_init: () => Promise<void>
declare var transformSync: typeof import('@swc/wasm-web').transformSync
declare var opendb: typeof import('./sys/api/util/db.js').opendb

importScripts('/os/sys/sw/wasm.js')
importScripts('/os/sys/sw/db.js')

const ready = __wbg_init()
const usrdb = opendb<{ path: string, content?: string }>('usr', 'path')
const mountdb = opendb<{ name: string, folder: FileSystemDirectoryHandle }>('mounts', 'name')

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
  return transformed.replace('/FAKEIMPORT/jsx-runtime', location.origin + '/os/sys/api/core/jsx.js')
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
  // console.log('fetch', e.request.url)
  if (!e.request.url.startsWith(location.origin)) {

    if (e.request.url.match(/\.tsx?$/)) {
      e.respondWith(fetch(e.request.url).then(async r => {
        const text = await r.text()
        return jsResponse(new URL(e.request.url), text)
      }))
      return
    }

    e.respondWith(fetch(e.request))
    return
  }

  const url = new URL(e.request.url)
  if (url.pathname.startsWith('/os/fs/')) {
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

function decompress(compressed: string) {
  const bstring = atob(compressed)
  const bytes = new Uint8Array(Array(bstring.length).keys().map(i => bstring.charCodeAt(i)))
  const blob = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Response(blob).text()
}

async function handleRoute(url: URL, req: Request) {
  if (url.pathname === '/os/fs/run') {
    const compressed = url.searchParams.get('code')!
    const code = await decompress(compressed)
    return await jsResponse(url, code)
  }

  if (url.pathname.startsWith('/os/fs/sys/')) {
    if (url.pathname.endsWith('.js')) {
      const res = await fetch(req)
      if (res.status !== 200) return res
      const text = await res.text()
      return await jsResponse(url, text)
    }
    return fetch(req)
  }

  if (url.pathname.startsWith('/os/fs/usr/')) {
    const key = url.pathname.slice('/os/fs/usr/'.length)
    const fs = await usrdb
    const res = await fs.get(key)
    if (res === undefined) return new Response('', { status: 404 })
    return await jsResponse(url, res.content!)
  }

  if (url.pathname.startsWith('/os/fs/')) {
    try {
      const m = url.pathname.match(/\/os\/fs\/(.+?)\/(.+)/)
      if (!m) return new Response('', { status: 404 })
      const [, drive, path] = m
      const parts = path.split('/')

      const mounts = await mountdb
      const item = await mounts.get(drive)
      if (!item) return new Response('', { status: 404 })

      let folder = item.folder
      for (const part of parts.slice(0, -1)) {
        folder = await folder.getDirectoryHandle(part)
      }

      const name = parts.at(-1)!.replace(/\.js$/, '.tsx')
      const fh = await folder.getFileHandle(name)
      const file = await fh.getFile()
      return jsResponse(url, await file.text())
    }
    catch (e) {
      console.error(e)
      return new Response('', { status: 500 })
    }
  }

  console.error('Not found:', url)
  return new Response('', { status: 404 })
}
