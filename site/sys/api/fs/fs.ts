import { Listener } from "../core/listener.js"
import { Drive } from "./drive.js"
import { NetDrive } from "./netfs.js"
import { SysDrive } from "./sysfs.js"
import { UsrDrive } from "./usrfs.js"

class FS {

  #watchers = new Map<string, Listener<string>>()
  #drives = new Map<string, Drive>()
  #syncfs!: (path: string, op: string) => void

  constructor() {
    this.#drives.set('sys', new SysDrive())
    this.#drives.set('usr', new UsrDrive())
    this.#drives.set('net', new NetDrive())

    const syncfs = new BroadcastChannel('syncfs')

    let syncing = false
    this.#syncfs = (path, op) => {
      if (syncing) return
      syncfs.postMessage([path, op])
    }

    syncfs.onmessage = (e) => {
      syncing = true
      const [path, op] = e.data
      this.#notify(path, op)
      syncing = false
      return
    }
  }

  drives() {
    return this.#drives.keys().toArray()
  }

  async getDir(path: string): Promise<string[]> {
    if (!path.endsWith('/')) path += '/'
    const [drive, parts] = this.#split(path)
    return drive.getDir(parts)
  }

  async putDir(path: string): Promise<boolean> {
    if (!path.endsWith('/')) path += '/'
    const [drive, parts] = this.#split(path)
    const success = await drive.putDir(parts)
    if (success) this.#notify(path, 'putDir')
    return success
  }

  async delDir(path: string): Promise<boolean> {
    if (!path.endsWith('/')) path += '/'
    const [drive, parts] = this.#split(path)
    const success = await drive.delDir(parts)
    if (success) this.#notify(path, 'delDir')
    return success
  }

  async getFile(path: string): Promise<string | null> {
    this.#checkfilepath(path)
    const [drive, parts] = this.#split(path)
    return drive.getFile(parts)
  }

  async putFile(path: string, content: string): Promise<boolean> {
    this.#checkfilepath(path)
    const [drive, parts] = this.#split(path)
    const success = await drive.putFile(parts, content)
    if (success) this.#notify(path, 'putFile')
    return success
  }

  async delFile(path: string): Promise<boolean> {
    this.#checkfilepath(path)
    const [drive, parts] = this.#split(path)
    const success = await drive.delFile(parts)
    if (success) this.#notify(path, 'delFile')
    return success
  }

  #notify(path: string, op: string) {
    this.#syncfs(path, op)
    for (const [p, w] of this.#watchers) {
      if (path.startsWith(p)) {
        w.dispatch(path)
      }
    }
  }

  #checkfilepath(path: string) {
    if (path.endsWith('/'))
      throw new Error('Invalid file path: ' + path)
  }

  #split(path: string): [Drive, string[]] {
    const parts = path.split('/')
    const drivename = parts.shift()
    if (!drivename || !this.#drives.has(drivename))
      throw new Error('No such drive for: ' + path)
    return [this.#drives.get(drivename)!, parts]
  }

  async copy(from: string, to: string) {
    const parts = from.split('/')

    if (from.endsWith('/')) {
      const last = parts.at(-2)
      const dest = to + last
      await this.#mkdirp(dest)
      await this.#copyTree(from, dest + '/')
    }
    else {
      const last = parts.at(-1)
      const content = await this.getFile(from)
      if (content === null) return false
      let dest = to + last
      while (await this.getFile(dest) !== null) {
        dest = dest.match(/\.[^\/]+$/)
          ? dest.replace(/\.[^\/]+$/, '_$&')
          : dest + '_'
      }
      await this.putFile(dest, content)
    }
    return true
  }

  async #copyTree(from: string, to: string) {
    for (const name of await this.getDir(from)) {
      if (name.endsWith('/')) {
        await this.#mkdirp(to + name)
        await this.#copyTree(from + name, to + name)
      }
      else {
        await this.putFile(to + name, (await this.getFile(from + name))!)
      }
    }
  }

  async #mkdirp(path: string) {
    if (path.endsWith('/')) path = path.replace(/\/+$/, '')
    const [drive, parts] = this.#split(path)

    for (let i = 0; i < parts.length; i++) {
      await drive.putDir(parts.slice(0, i + 1))
    }
  }

  watchTree(path: string, fn: () => void) {
    let watcher = this.#watchers.get(path)
    if (!watcher) this.#watchers.set(path, watcher = new Listener())
    return watcher.watch(fn)
  }

}

export const fs = new FS()
