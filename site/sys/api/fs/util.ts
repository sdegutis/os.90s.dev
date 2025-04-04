export function listdir(full: string, entries: { path: string, content?: string }[]): string[] {
  return entries
    .map(file => file.content === undefined ? file.path + '/' : file.path)
    .filter(path => path.startsWith(full))
    .map(path => path.slice(full.length))
    .filter(name => name)
    .map(name => name.match(/^[^\/]+\/?/)![0])
    .reduce((set, name) => set.add(name), new Set<string>())
    .values()
    .toArray()
}
