import { Drive, DriveFile, DriveFolder, DriveNotificationType } from "/server/fs/drive.js"

type MountedFile = DriveFile & { handle: FileSystemFileHandle }
type MountedFolder = DriveFolder & { handle: FileSystemDirectoryHandle }
type MountedItem = MountedFile | MountedFolder

export class MountedDrive implements Drive {

  items = new Map<string, MountedItem>()
  root: FileSystemDirectoryHandle
  notify?: (type: DriveNotificationType, path: string) => void
  unmount = () => { }

  constructor(root: FileSystemDirectoryHandle) {
    this.root = root
  }

  async mount(notify: (type: DriveNotificationType, path: string) => void) {
    this.notify = notify
    await this.scan('', this.root)

    let processChanges = Promise.resolve()
    const observer = new FileSystemObserver(changes => {
      processChanges = processChanges.then(async () => {
        for (const change of changes) {
          await this.handleChange(change)
        }
      })
    })
    this.unmount = () => observer.disconnect()

    observer.observe(this.root, { recursive: true })
  }

  private async scan(path: string, dir: FileSystemDirectoryHandle) {
    for await (const [name, handle] of dir.entries()) {
      const isdir = handle instanceof FileSystemDirectoryHandle
      const fullpath = path + name + (isdir ? '/' : '')

      await this.add(fullpath, handle)

      if (isdir) {
        await this.scan(fullpath, handle)
      }
    }
  }

  private async add(path: string, handle: FileSystemDirectoryHandle | FileSystemFileHandle) {
    if (handle instanceof FileSystemDirectoryHandle) {
      this.items.set(path, { type: 'folder', handle })
    }
    else {
      const f = await handle.getFile()
      const content = await f.text()
      this.items.set(path, { type: 'file', handle, content })
    }
  }

  async putdir(path: string) {
    const parts = path.split('/')

    const parentpath = parts.slice(0, -2).join('/') + '/'
    const parent = this.items.get(parentpath) as MountedFolder | undefined
    const parenthandle = parent?.handle ?? this.root

    const name = parts.at(-2)!
    const handle = await parenthandle.getDirectoryHandle(name, { create: true })
    this.items.set(path, { type: 'folder', handle })
  }

  async putfile(path: string, content: string) {
    let file = this.items.get(path) as MountedFile | undefined

    if (file) {
      file.content = content
    }
    else {
      const parts = path.split('/')

      const parentpath = parts.slice(0, -1).join('/') + '/'
      const parent = this.items.get(parentpath) as MountedFolder | undefined
      const parenthandle = parent?.handle ?? this.root

      const name = parts.at(-1)!
      const handle = await parenthandle.getFileHandle(name, { create: true })
      this.items.set(path, file = { type: 'file', content, handle })
    }

    const w = await file.handle.createWritable()
    await w.write(content)
    await w.close()
  }

  private async handleChange(change: FileSystemObserverRecord) {
    if (change.type === 'unknown') {
      console.warn('unknown fs event', change)
      return
    }

    const isdir = change.changedHandle instanceof FileSystemDirectoryHandle
    const end = isdir ? '/' : ''
    const path = change.relativePathComponents.join('/') + end

    if (change.type === 'moved') {
      const oldpath = change.relativePathMovedFrom.join('/') + end
      const item = this.items.get(oldpath)!
      this.items.delete(oldpath)
      this.items.set(path, item)
      item.handle = change.changedHandle
      this.notify?.('disappeared', oldpath)
      this.notify?.('appeared', path)
      return
    }

    if (change.type === 'appeared') {
      await this.add(path, change.changedHandle)
      this.notify?.('appeared', path)
      return
    }

    if (change.type === 'modified') {
      const item = this.items.get(path) as MountedFile | undefined
      if (item) {
        const f = await item.handle.getFile()
        item.content = await f.text()
      }
      this.notify?.('modified', path)
      return
    }

    if (change.type === 'disappeared' || change.type === 'errored') {
      this.items.delete(path + '/') || this.items.delete(path)
      this.notify?.('disappeared', path)
      return
    }
  }

  private async parenthandle(path: string) {
    const parts = path.split('/')
    const name = parts.pop()!
    const parentpath = parts.join('/') + '/'
    const parent = this.items.get(parentpath) as MountedFolder | undefined
    return [parent?.handle ?? this.root, name] as const
  }

  async rmdir(path: string) {
    const [handle, name] = await this.parenthandle(path.slice(0, -1))
    for (const key of this.items.keys()) {
      if (key.startsWith(path)) {
        this.items.delete(key)
      }
    }
    await handle.removeEntry(name, { recursive: true })
  }

  async rmfile(path: string) {
    const [handle, name] = await this.parenthandle(path)
    this.items.delete(path)
    await handle.removeEntry(name, { recursive: true })
  }

}

type FileSystemObserverRecord =
  | { root: FileSystemDirectoryHandle, relativePathComponents: string[], type: 'appeared', changedHandle: FileSystemFileHandle | FileSystemDirectoryHandle }
  | { root: FileSystemDirectoryHandle, relativePathComponents: string[], type: 'disappeared', changedHandle: null }
  | { root: FileSystemDirectoryHandle, relativePathComponents: string[], type: 'modified', changedHandle: FileSystemFileHandle | FileSystemDirectoryHandle }
  | { root: FileSystemDirectoryHandle, relativePathComponents: string[], type: 'moved', changedHandle: FileSystemFileHandle | FileSystemDirectoryHandle, relativePathMovedFrom: string[] }
  | { root: FileSystemDirectoryHandle, relativePathComponents: string[], type: 'unknown', changedHandle: null }
  | { root: FileSystemDirectoryHandle, relativePathComponents: string[], type: 'errored', changedHandle: null }

declare class FileSystemObserver {
  constructor(callback: (records: FileSystemObserverRecord[], observer: FileSystemObserver) => void)
  observe(fileHandle: FileSystemHandle): void
  observe(fileHandle: FileSystemDirectoryHandle, options?: { recursive: boolean }): void
  private unobserve(fileHandle: FileSystemHandle): void
  disconnect(): void
}
