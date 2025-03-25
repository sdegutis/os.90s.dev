import { files } from "./data.js"
import { type Drive, type DriveItem, type DriveNotificationType } from "./drive.js"

export class SysDrive implements Drive {

  items = new Map<string, DriveItem>()
  notify?: (type: DriveNotificationType, path: string) => void

  async mount(notify: (type: DriveNotificationType, path: string) => void) {
    this.notify = notify

    for (const [path, content] of Object.entries(files)) {
      this.items.set(path, { type: 'file', content })

      const dirs = path.split('/').slice(0, -1)
      for (let i = 0; i < dirs.length; i++) {
        const dir = dirs.slice(0, i + 1).join('/') + '/'
        this.putdir(dir)
      }
    }
  }

  async putdir(path: string) {
    this.items.set(path, { type: 'folder' })
    this.notify?.('modified', path)
  }

  async putfile(path: string, content: string) {
    const has = this.items.has(path)
    this.items.set(path, { type: 'file', content })
    this.notify?.(has ? 'modified' : 'appeared', path)
  }

  async rmdir(path: string) {
    for (const key of this.items.keys()) {
      if (key.startsWith(path)) {
        this.items.delete(key)
      }
    }
    this.notify?.('disappeared', path)
  }

  async rmfile(path: string) {
    this.items.delete(path)
    this.notify?.('disappeared', path)
  }

}
