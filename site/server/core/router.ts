import { compile } from "../../swc/vm.js"
import { openUserDb } from "../fs/userfs.js"

const fsinit = openUserDb()

const jsHeaders = {
  headers: {
    "content-type": "application/javascript; charset=utf-8"
  }
}

async function jsResponse(text: string) {
  const compiled = await compile(text)
  const prelude = await fetch('/prelude.js').then(r => r.text())
  return new Response((`${prelude}\n\n${compiled}`), jsHeaders)
}

export async function handleRoute(url: URL, req: Request) {
  const fs = await fsinit

  if (url.pathname.startsWith('/fs/sys/')) {
    if (url.pathname.endsWith('.js')) {
      let text = await fetch(req).then(r => r.text())
      return await jsResponse(text)
    }
    return fetch(req)
  }

  if (url.pathname.startsWith('/fs/user/')) {
    const key = url.pathname.slice('/fs/user/'.length)
    const res = await fs.get(key)
    return await jsResponse(res.content ?? '')
  }

  console.log(url.pathname)
  return new Response('heyllo orld')
}
