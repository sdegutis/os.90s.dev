import { BC } from "../core/bc.js"
import { Listener } from "../core/listener.js"
import { opendb } from "../util/db.js"
import { Drive } from "./drive.js"
import { MountDrive } from "./mountfs.js"
import { NetDrive } from "./netfs.js"
import { SysDrive } from "./sysfs.js"
import { UsrDrive } from "./usrfs.js"

const mounts = await opendb<{
  name: string,
  folder: FileSystemDirectoryHandle,
}>('mounts', 'name')

class FS {

  #watchers = new Map<string, Listener<string>>()
  #drives = new Map<string, Drive>()
  #syncfs!: (path: string, op: string) => void

  constructor() {
    this.#drives.set('sys', new SysDrive())
    this.#drives.set('usr', new UsrDrive())
    this.#drives.set('net', new NetDrive())

    mounts.all().then(mounts => {
      mounts.forEach(mount => {
        this.#drives.set(mount.name, new MountDrive(mount.folder))
      })
    })

    type FsEvent = { type: 'sync', op: string, path: string }
    const fsevents = new BC<FsEvent>('fsevents', null)
    this.#syncfs = (path, op) => fsevents.emit({ type: 'sync', path, op })
    fsevents.handle((e) => this.#notify(e.path, e.op, false))
  }

  drives() {
    return this.#drives.keys().toArray()
  }

  async getDir(path: string): Promise<string[] | null> {
    if (!path.endsWith('/')) path += '/'
    const [drive, parts] = this.#split(path)
    const items = await drive.getDir(parts)
    if (!items) return null
    items.sort((a, b) => {
      if (a.endsWith('/') && !(b.endsWith('/'))) return -1
      if (b.endsWith('/') && !(a.endsWith('/'))) return +1
      return a.localeCompare(b)
    })
    return items
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

  #notify(path: string, op: string, sync = true) {
    if (sync) this.#syncfs(path, op)
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

  async mount(name: string, folder: FileSystemDirectoryHandle) {
    if (this.#drives.has(name)) return false
    this.#drives.set(name, new MountDrive(folder))
    this.#notify(name, 'mount')
    await mounts.set({ name, folder })
    return true
  }

  async unmount(name: string) {
    name = name.replace(/\/+$/, '')
    if (['sys', 'usr', 'net'].includes(name)) return false
    this.#drives.delete(name)
    await mounts.del(name)
    this.#notify(name, 'unmount')
    return true
  }

  async move(from: string, to: string) {
    const isDir = pathFns.isDir(from)
    const isRel = pathFns.isRel(to)

    if (isRel) to = pathFns.adopt(pathFns.parent(from)!, to)
    if (isDir && !pathFns.isDir(to)) to += '/'

    const success = await this.copy(from, to)
    if (!success) return

    if (from.endsWith('/')) {
      await this.delDir(from)
    }
    else {
      await this.delFile(from)
    }
  }

  async copy(from: string, to: string) {
    if (pathFns.isDir(from)) {
      const children = await this.getDir(from)
      if (!children) return false

      if (!pathFns.isDir(to)) to += '/'

      await this.putDir(to)
      for (const name of children) {
        await this.copy(from + name, to + name)
      }
    }
    else {
      const content = await this.getFile(from)
      if (content === null) return false

      await this.putFile(await this.uniqueFilename(to), content)
    }
    return true
  }

  async get(path: string) {
    if (pathFns.isDir(path)) {
      return this.getDir(path)
    }
    else {
      return this.getFile(path)
    }
  }

  async uniqueFilename(ideal: string) {
    while (await this.get(ideal) !== null) {
      ideal = ideal.replace(/(\.\w+)?\/?$/, '_$&')
    }
    return ideal
  }

  watchTree(path: string, fn: () => void) {
    let watcher = this.#watchers.get(path)
    if (!watcher) this.#watchers.set(path, watcher = new Listener())
    return watcher.watch(fn)
  }

}

export const fs = new FS()

export const pathFns = {
  normalize: (path: string) => path.replace(/\/{2,}/g, '/'),
  orphan: (path: string) => path.match(/\/([\w._$]+\/?)$/)?.[1],
  parent: (path: string) => path.match(/([\w._$]+\/(?!$))+/)?.[0],
  adopt: (parent: string, orphan: string) => pathFns.normalize(parent) + orphan,
  isDir: (path: string) => path.endsWith('/'),
  isRel: (path: string) => path.indexOf('/') === -1 || path.indexOf('/') === path.length - 1,
}
