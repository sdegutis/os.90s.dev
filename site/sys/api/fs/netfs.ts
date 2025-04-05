import { config } from "../config.js"
import { files } from "./data.js"
import { Drive } from "./drive.js"

export class NetDrive implements Drive {

  async getDir(path: string[]): Promise<string[]> {
    const full = path.join('/')
    const url = config.net + '/fs/' + full
    console.log(url)
    return await fetch(url).then(r => r.json())
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
