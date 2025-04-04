import { Listener } from "../core/listener.js"
import { Drive } from "./drive.js"
import { SysDrive } from "./sysfs.js"
import { UsrDrive } from "./usrfs.js"

class FS {

  #watchers = new Map<string, Listener<string>>()
  #drives = new Map<string, Drive>()
  #syncfs!: (path: string, op: string) => void

  constructor() {
    this.#drives.set('sys', new SysDrive())
    this.#drives.set('usr', new UsrDrive())
  }

  async init(syncfs: MessagePort, id: number) {
    let syncing = false
    this.#syncfs = (path, op) => {
      if (syncing) return
      syncfs.postMessage({ type: 'sync', path, op, id })
    }

    syncfs.onmessage = (e) => {
      if (e.data.type === 'ping') {
        syncfs.postMessage({ type: 'pong', id })
        return
      }

      if (e.data.type === 'sync') {
        syncing = true
        const { path, op } = e.data
        this.#notify(path, op)
        syncing = false
        return
      }
    }

    syncfs.postMessage({ type: 'init', id })
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

  // async cp(from: string, to: string) {
  //   this.syncfs('cp', [from, to])

  //   const parts = from.split('/')

  //   if (from.endsWith('/')) {
  //     const last = parts.at(-2)
  //     const dest = to + last
  //     await this.mkdirp(dest)
  //     await this.copyTree(from, dest + '/')
  //   }
  //   else {
  //     const last = parts.at(-1)
  //     const content = this.get(from)
  //     if (!content) return
  //     let dest = to + last
  //     while (this.get(dest)) dest += '_'
  //     await this.put(dest, content)
  //   }
  // }

  // async copyTree(from: string, to: string) {
  //   this.syncfs('copyTree', [from, to])

  //   for (const item of this.list(from)) {
  //     if (item.type === 'folder') {
  //       await this.mkdirp(to + item.name)
  //       await this.copyTree(from + item.name, to + item.name)
  //     }
  //     else {
  //       this.put(to + item.name, this.get(from + item.name)!)
  //     }
  //   }
  // }

  // async mkdirp(path: string) {
  //   this.syncfs('mkdirp', [path])

  //   if (path.endsWith('/')) path = path.replace(/\/+$/, '')

  //   const [drive, subpath] = this.prepare(path)
  //   const parts = subpath.split('/')

  //   for (let i = 0; i < parts.length; i++) {
  //     const dir = parts.slice(0, i + 1).join('/') + '/'
  //     if (!drive.items.has(dir)) {
  //       await drive.putdir(dir)
  //     }
  //   }
  // }

  watchTree(path: string, fn: () => void) {
    let watcher = this.#watchers.get(path)
    if (!watcher) this.#watchers.set(path, watcher = new Listener())
    return watcher.watch(fn)
  }

}

export const fs = new FS()
