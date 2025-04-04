export type DirItem = { type: 'folder' | 'file', name: string }

export interface Drive {
  getDir(path: string[]): Promise<DirItem[]>
  putDir(path: string[]): Promise<boolean>
  delDir(path: string[]): Promise<boolean>
  getFile(path: string[]): Promise<string | null>
  putFile(path: string[], content: string): Promise<boolean>
  delFile(path: string[]): Promise<boolean>
}
