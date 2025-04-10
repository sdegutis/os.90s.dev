import { GET } from "../util/net.js"
import { Drive } from "./drive.js"

export class NetDrive implements Drive {

  async getDir(path: string[]): Promise<string[]> {
    const [err, list] = await GET('/fs/' + path.join('/'))
    if (err) throw new Error(err)
    return list
  }

  async putDir(path: string[]): Promise<boolean> {
    return false
  }

  async delDir(path: string[]): Promise<boolean> {
    return false
  }

  async getFile(path: string[]): Promise<string | null> {
    const full = path.join('/')
    return null
  }

  async putFile(path: string[], content: string): Promise<boolean> {
    // console.log(path, content)

    return false
  }

  async delFile(path: string[]): Promise<boolean> {
    return false
  }

}
