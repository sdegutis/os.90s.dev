import { DirItem } from "./drive.js"

export function listdir(full: string, entries: { path: string, content?: string }[]): DirItem[] {
  return entries
    .map(file => file.path)
    .filter(path => path.startsWith(full))
    .map(path => path.slice(full.length))
    .map(name => name.match(/^[^\/]+\/?/)![0])
    .reduce((set, name) => set.add(name), new Set<string>())
    .values()
    .toArray()
    .map(name => ({
      type: name.endsWith('/') ? 'folder' : 'file',
      name: name,
    }))
}
