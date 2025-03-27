import { Listener } from "/client/core/listener.js"
import type { Drive, DriveNotificationType } from "/server/fs/drive.js"
import { MountedDrive } from "/server/fs/mountfs.js"
import { SysDrive } from "/server/fs/sysfs.js"
import { UserDrive } from "/server/fs/userfs.js"
import { opendb } from "/server/util/db.js"

class FS {

  private mounts!: Awaited<ReturnType<typeof opendb<{ drive: string, dir: FileSystemDirectoryHandle }>>>
  private _drives = new Map<string, Drive>()
  private watchers = new Map<string, Listener<DriveNotificationType>>()

  constructor() {
    this.addDrive('sys', new SysDrive())
  }

  async init() {
    await this.addDrive('user', new UserDrive())

    this.mounts = await opendb<{ drive: string, dir: FileSystemDirectoryHandle }>('mounts', 'drive')
    for (const { drive, dir } of await this.mounts.all()) {
      await this.addDrive(drive, new MountedDrive(dir))
    }
  }

  async mount(drive: string, folder: FileSystemDirectoryHandle) {
    this.mounts.set({ drive, dir: folder })
    await this.addDrive(drive, new MountedDrive(folder))
  }

  unmount(drive: string) {
    this.mounts.del(drive)
    this.removeDrive(drive)
  }

  drives() {
    return this._drives.keys().map(s => s + '/').toArray()
  }

  async mkdirp(path: string) {
    if (path.endsWith('/')) path = path.replace(/\/+$/, '')

    const [drive, subpath] = this.prepare(path)
    const parts = subpath.split('/')

    for (let i = 0; i < parts.length; i++) {
      const dir = parts.slice(0, i + 1).join('/') + '/'
      if (!drive.items.has(dir)) {
        await drive.putdir(dir)
      }
    }
  }

  async rm(path: string) {
    const [drive, subpath] = this.prepare(path)
    await drive.rmfile(subpath)
  }

  async rmdir(path: string) {
    if (!path.endsWith('/')) path += '/'
    const [drive, subpath] = this.prepare(path)
    await drive.rmdir(subpath)
  }

  list(path: string) {
    const [drive, subpath] = this.prepare(path)
    const r = new RegExp(`^${subpath}[^/]+?/?$`)
    return (drive.items
      .entries()
      .map(([k, v]) => {
        const m = k.match(r)?.[0]
        if (!m) return null

        const name = m.slice(subpath.length)
        const type = v.type

        if (type === 'folder')
          return { name, type }
        else
          return { name, type, content: v.content }
      })
      .filter(e => e !== null)
      .toArray()
      .sort(sortBy(e => (e.type === 'folder' ? 0 : 1) + e.name)))
  }

  get(path: string): string | undefined {
    const [drive, subpath] = this.prepare(path)
    const item = drive.items.get(subpath)
    if (item?.type === 'file') return normalize(item.content)
    return undefined
  }

  async put(filepath: string, content: string) {
    const [drive, subpath] = this.prepare(filepath)
    await drive.putfile(subpath, normalize(content))
  }

  watchTree(path: string, fn: (type: DriveNotificationType) => void) {
    let watcher = this.watchers.get(path)
    if (!watcher) this.watchers.set(path, watcher = new Listener())
    return watcher.watch(fn)
  }


  private prepare(fullpath: string) {
    const parts = fullpath.split('/')
    const drivename = parts.shift()!
    const drive = this._drives.get(drivename)!
    return [drive, parts.join('/')] as const
  }

  private notify(type: DriveNotificationType, path: string) {
    for (const [p, w] of this.watchers) {
      if (path.startsWith(p)) {
        w.dispatch(type)
      }
    }
  }

  private addDrive(name: string, drive: Drive) {
    this._drives.set(name, drive)
    return drive.mount((type, path) => this.notify(type, name + '/' + path))
  }

  private removeDrive(name: string) {
    if (name === 'sys' || name === 'user') return
    this._drives.get(name)?.unmount?.()
    this._drives.delete(name)
  }


}

function sortBy<T, U>(fn: (o: T) => U) {
  return (a: T, b: T) => {
    const aa = fn(a)
    const bb = fn(b)
    if (aa < bb) return -1
    if (aa > bb) return +1
    return 0
  }
}

function normalize(content: string) {
  return content.replace(/\r\n/g, '\n')
}

export const fs = new FS()
await fs.init()
