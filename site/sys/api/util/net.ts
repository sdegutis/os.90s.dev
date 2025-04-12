import { NETHOST } from "../config.js"

export async function POST(path: string, data: string) {
  return fetch(NETHOST + path, {
    method: 'post',
    body: data,
    credentials: 'include',
  }).then(r => r.json())
}

export async function GET(path: string) {
  return fetch(NETHOST + path, {
    credentials: 'include',
  }).then(r => r.json())
}
