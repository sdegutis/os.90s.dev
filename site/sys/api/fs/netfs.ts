import { config } from "../config.js"
import { GET, POST } from "../util/net.js"
import { Drive } from "./drive.js"

export class NetDrive implements Drive {

  async getDir(path: string[]): Promise<string[]> {
    const [err, list] = await GET('/fs/' + path.join('/'))
    if (err) throw new Error(err)
    return list
  }

  async putDir(path: string[]): Promise<boolean> {
    console.log('in here', '/fs/' + path.join('/'))
    const [err] = await POST('/fs/' + path.join('/'), 'mkdir')
    if (err) throw new Error(err)
    return true
  }

  async delDir(path: string[]): Promise<boolean> {
    return false
  }

  async getFile(path: string[]): Promise<string | null> {
    return await fetch(config.net + '/fs/' + path.join('/'), {
      credentials: 'include',
    }).then(r => r.text())
  }

  async putFile(path: string[], content: string): Promise<boolean> {
    const [err] = await POST('/fs/' + path.join('/'), content)
    if (err) throw new Error(err)
    return true
  }

  async delFile(path: string[]): Promise<boolean> {
    const [err] = await POST('/fs/' + path.join('/') + '?delete', '')
    if (err) throw new Error(err)
    return true
  }

}
