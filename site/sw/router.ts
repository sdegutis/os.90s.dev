import { openUserDb } from "../server/fs/userfs.js"
import { compile } from "./compile.js"

const jsHeaders = {
  headers: {
    "content-type": "application/javascript; charset=utf-8"
  }
}

async function jsResponse(text: string) {
  const compiled = await compile(text)
  return new Response(compiled, jsHeaders)
}

export async function handleRoute(url: URL, req: Request) {
  if (url.pathname.startsWith('/fs/sys/')) {
    if (url.pathname.endsWith('.js')) {
      let text = await fetch(req).then(r => r.text())
      return await jsResponse(text)
    }
    return fetch(req)
  }

  if (url.pathname.startsWith('/fs/user/')) {
    const key = url.pathname.slice('/fs/user/'.length)
    const fs = await openUserDb()
    const res = await fs.get(key)
    fs.off()
    return await jsResponse(res?.content ?? '')
  }

  console.log(url.pathname)
  return new Response('TEST')
}
