import { openUserDb } from "/server/fs/userfs.js"
import { compile } from "/swc/vm.js"

const jsHeaders = {
  headers: { "content-type": "application/javascript" }
}

export async function handleRoute(url: URL, req: Request) {
  if (url.pathname.startsWith('/fs/sys/')) {
    if (url.pathname.endsWith('.js')) {
      const text = await fetch(req).then(r => r.text())
      return new Response(await compile(text), jsHeaders)
    }
    return fetch(req)
  }

  if (url.pathname.startsWith('/fs/user/')) {
    const fs = await openUserDb()
    const key = url.pathname.slice('/fs/user/'.length)
    const res = await fs.get(key)
    return new Response((await compile(res.content ?? '')), jsHeaders)
  }

  console.log(url.pathname)
  return new Response('heyllo orld')
}
