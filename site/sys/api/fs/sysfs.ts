import { files } from "./data.js"
import { Drive } from "./drive.js"
import { listdir } from "./util.js"

export class SysDrive implements Drive {

  async getDir(path: string[]): Promise<string[]> {
    return listdir(path.join('/'), files)
  }

  async putDir(path: string[]): Promise<boolean> {
    return false
  }

  async delDir(path: string[]): Promise<boolean> {
    return false
  }

  async getFile(path: string[]): Promise<string | null> {
    const full = path.join('/')
    return files.find(f => f.path === full)?.content ?? null
  }

  async putFile(path: string[], content: string): Promise<boolean> {
    return false
  }

  async delFile(path: string[]): Promise<boolean> {
    return false
  }

}
