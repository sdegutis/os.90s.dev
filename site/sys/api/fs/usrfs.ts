import { opendb } from "../util/db.js"
import type { Drive } from "./drive.js"



function listdir(full: string, entries: { path: string, content?: string }[]): string[] {
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


// new EventSource('/_reload').onmessage = () => location.reload()

// navigator.locks.request('testing', async () => {

//   console.log(files)
//   console.log(listdir(['default', 'conf', ''].join('/'), files))

//   await new Promise(r => { })
// })


const usrdb = opendb<{ path: string, content?: string }>('usr', 'path')

export class UsrDrive implements Drive {

  async getDir(path: string[]): Promise<string[]> {
    const db = await usrdb
    const all = await db.all()
    return listdir(path.join('/'), all)
  }

  async putDir(path: string[]): Promise<boolean> {
    const db = await usrdb
    await db.set({ path: path.join('/') })
    return true
  }

  async delDir(path: string[]): Promise<boolean> {
    const db = await usrdb
    const all = await db.all()
    const full = path.join('/')
    const toDelete = all.map(f => f.path).filter(p => p.startsWith(full))
    toDelete.push(full.slice(0, -1))
    await Promise.all(toDelete.map(p => db.del(p)))
    return true
  }

  async getFile(path: string[]): Promise<string | null> {
    const db = await usrdb
    const file = await db.get(path.join('/'))
    return file?.content ?? null
  }

  async putFile(path: string[], content: string): Promise<boolean> {
    const db = await usrdb
    await db.set({ path: path.join('/'), content })
    return true
  }

  async delFile(path: string[]): Promise<boolean> {
    const db = await usrdb
    await db.del(path.join('/'))
    return true
  }

}
