export type DriveFile = { type: 'file', content: string }
export type DriveFolder = { type: 'folder' }
export type DriveItem = DriveFolder | DriveFile

export type DriveNotificationType = 'appeared' | 'disappeared' | 'modified'

export interface Drive {

  items: Map<string, DriveItem>

  mount(notify: (type: DriveNotificationType, path: string) => void): Promise<void>
  unmount?(): void

  putdir(path: string): Promise<void>
  putfile(path: string, content: string): Promise<void>

  rmdir(path: string): Promise<void>
  rmfile(path: string): Promise<void>

}
