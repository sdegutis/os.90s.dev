import { openUserDb } from "/server/fs/userfs.js"

export async function handleRoute(url: URL, req: Request) {
  if (url.pathname.startsWith('/fs/sys/')) {
    return fetch(req)
  }

  if (url.pathname.startsWith('/fs/user/')) {
    const fs = await openUserDb()
    const key = url.pathname.slice('/fs/user/'.length)
    const res = await fs.get(key)
    return new Response(res.content, {
      headers: { "content-type": "application/javascript" }
    })
  }

  console.log(url.pathname)
  return new Response('heyllo orld')
}
