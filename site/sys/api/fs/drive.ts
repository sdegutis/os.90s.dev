export interface Drive {
  getDir(path: string[]): Promise<string[] | null>
  putDir(path: string[]): Promise<boolean>
  delDir(path: string[]): Promise<boolean>
  getFile(path: string[]): Promise<string | null>
  putFile(path: string[], content: string): Promise<boolean>
  delFile(path: string[]): Promise<boolean>
}
