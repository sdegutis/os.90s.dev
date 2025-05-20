import { files } from "./data.js"
import { Drive } from "./drive.js"


export class SysDrive implements Drive {

  async getDir(path: string[]): Promise<string[]> {
    return listdir(path.join('/'), files)
  }

  async putDir(path: string[]): Promise<boolean> {
    return false
  }

  async delDir(path: string[]): Promise<boolean> {
    return false
  }

  async getFile(path: string[]): Promise<string | null> {
    const full = path.join('/')
    return files.find(f => f.path === full)?.content ?? null
  }

  async putFile(path: string[], content: string): Promise<boolean> {
    return false
  }

  async delFile(path: string[]): Promise<boolean> {
    return false
  }

}

function listdir(full: string, entries: { path: string, content?: string }[]): string[] {
  // more firefox esr fun
  return [...entries
    .map(file => file.content === undefined ? file.path + '/' : file.path)
    .filter(path => path.startsWith(full))
    .map(path => path.slice(full.length))
    .filter(name => name)
    .map(name => name.match(/^[^\/]+\/?/)![0])
    .reduce((set, name) => set.add(name), new Set<string>())
    .values()]
}
