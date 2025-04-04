import { opendb } from "../util/db.js"
import type { Drive } from "./drive.js"
import { listdir } from "./util.js"

export const usrdb = opendb<{ path: string, content?: string }>('usr', 'path')

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
    console.log(path)
    return false
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
