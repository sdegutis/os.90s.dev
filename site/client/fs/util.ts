export function listdir(full: string, entries: { path: string, content?: string }[]): string[] {
  return entries
    .map(file => file.path)
    .filter(path => path.startsWith(full))
    .map(path => path.slice(full.length))
    .map(name => name.match(/^[^\/]+\/?/)![0])
    .reduce((set, name) => set.add(name), new Set<string>())
    .values()
    .toArray()
}
