export async function runJsFile(path: string, decache = true) {
  path = '/os/fs/' + path
  if (decache) path += '?decache=' + Date.now()
  return await import(path)
}

const absPrefix = `${location.origin}/os/fs/`
export const currentAppPath = location.href.slice(absPrefix.length)

export function fsPathOf(url: string) {
  return url.slice(absPrefix.length).replace(/\?decache=\d+$/, '')
}
