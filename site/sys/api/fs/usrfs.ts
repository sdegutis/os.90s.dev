import { opendb } from "../util/db.js"
import type { Drive } from "./drive.js"

const db = await opendb<{
  path: string,
  file: string,
  dir: string,
  content?: string,
}>('usr', 'path')

export class UsrDrive implements Drive {

  async getDir(path: string[]): Promise<string[] | null> {
    const all = await db.all()
    const parent = path.join('/')
    if (parent !== '' && !all.some(f => f.path === parent)) return null

    return all.filter(it => it.dir === parent).map(it => it.file)
  }

  async putDir(path: string[]): Promise<boolean> {
    let last = ''
    for (let dir of path.slice(0, -1)) {
      dir += '/'
      await db.set({ dir: last, file: dir, path: last + dir })
      last += dir
    }
    return true
  }

  async delDir(path: string[]): Promise<boolean> {
    const all = await db.all()
    const full = path.join('/')
    const within = all.filter(it => it.dir.startsWith(full))
    await Promise.all([
      db.del(full),
      ...within.map(it => db.del(it.path))
    ])
    return true
  }

  async getFile(path: string[]): Promise<string | null> {
    const file = await db.get(path.join('/'))
    return file?.content ?? null
  }

  async putFile(path: string[], content: string): Promise<boolean> {
    const file = path.pop()!
    const dir = path.map(d => d + '/').join('')
    await db.set({ dir, file, content, path: dir + file })
    return true
  }

  async delFile(path: string[]): Promise<boolean> {
    await db.del(path.join('/'))
    return true
  }

}
