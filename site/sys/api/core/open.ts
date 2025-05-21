const absPrefix = `${location.origin}/fs/`
export const currentAppPath = location.href.slice(absPrefix.length)

export function fsPathOf(url: string) {
  return url.slice(absPrefix.length).replace(/\?decache=\d+$/, '')
}
