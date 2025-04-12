import { NETHOST } from "../core/nethost.js"
import { GET, POST } from "../util/net.js"
import { Drive } from "./drive.js"

export class NetDrive implements Drive {

  async getDir(path: string[]): Promise<string[]> {
    const [err, list] = await GET('/fs/' + path.join('/'))
    if (err) throw new Error(err)
    return list
  }

  async putDir(path: string[]): Promise<boolean> {
    const [err] = await POST('/fs/' + path.join('/'), 'mkdir')
    if (err) throw new Error(err)
    return true
  }

  async delDir(path: string[]): Promise<boolean> {
    const [err] = await POST('/fs/' + path.join('/'), 'rmdir')
    if (err) throw new Error(err)
    return true
  }

  async getFile(path: string[]): Promise<string | null> {
    const res = await fetch(NETHOST + '/fs/' + path.join('/'), {
      credentials: 'include',
    })
    if (res.status !== 200) return null
    return await res.text()
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
