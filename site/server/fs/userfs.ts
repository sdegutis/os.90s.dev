import type { Drive, DriveItem, DriveNotificationType } from "/server/fs/drive.js"
import { opendb } from "/server/util/db.js"

export class UserDrive implements Drive {

  db!: Awaited<ReturnType<typeof opendb<{ path: string, content?: string }>>>
  items = new Map<string, DriveItem>()
  notify?: (type: DriveNotificationType, path: string) => void

  async mount(notify: (type: DriveNotificationType, path: string) => void) {
    this.notify = notify
    this.db = await opendb<{ path: string, content?: string }>('idbfs', 'path')

    for (const { path, content } of await this.db.all()) {
      if (path.endsWith('/')) {
        this.items.set(path, { type: 'folder' })
      }
      else {
        this.items.set(path, { type: 'file', content: content! })
      }
    }
  }

  async putdir(path: string) {
    this.items.set(path, { type: 'folder' })
    this.db.set({ path })
    this.notify?.('modified', path)
  }

  async putfile(path: string, content: string) {
    const has = this.items.has(path)
    this.items.set(path, { type: 'file', content })
    this.db.set({ path, content })
    this.notify?.(has ? 'modified' : 'appeared', path)
  }

  async rmdir(path: string) {
    for (const key of this.items.keys()) {
      if (key.startsWith(path)) {
        this.items.delete(key)
        this.db.del(key)
      }
    }
    this.notify?.('disappeared', path)
  }

  async rmfile(path: string) {
    this.items.delete(path)
    this.db.del(path)
    this.notify?.('disappeared', path)
  }

}
