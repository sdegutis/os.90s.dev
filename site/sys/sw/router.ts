import { usrdb } from "../api/fs/usrfs.js"
import { compile } from "./compile.js"

const jsHeaders = {
  headers: {
    "content-type": "application/javascript; charset=utf-8"
  }
}

async function jsResponse(url: URL, text: string) {
  const compiled = await compile(url, text)
  return new Response(compiled, jsHeaders)
}

export async function handleRoute(url: URL, req: Request) {
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

  // if (url.pathname.startsWith('/fs/net/')) {
  //   const key = url.pathname.slice('/fs/usr/'.length)
  //   const fs = await usrdb
  //   const res = await fs.get(key)
  //   return await jsResponse(url, res?.content ?? '')
  // }

  return new Response('TEST')
}
