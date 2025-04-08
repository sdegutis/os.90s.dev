import { config } from "../config.js"

export async function POST(path: string, data: string) {
  return fetch(config.net + path, {
    method: 'post',
    body: data,
    credentials: 'include',
  }).then(r => r.json())
}

export async function GET(path: string) {
  return fetch(config.net + path, {
    credentials: 'include',
  }).then(r => r.json())
}
