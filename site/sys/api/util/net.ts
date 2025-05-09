
export async function POST(path: string, data: string) {
  return fetch('/net' + path, {
    method: 'post',
    body: data,
    credentials: 'include',
  }).then(r => r.json())
}

export async function GET(path: string) {
  return fetch('/net' + path, {
    credentials: 'include',
  }).then(r => r.json())
}
