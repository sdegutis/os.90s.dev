import { Drive } from "./drive.js"

export class MountDrive implements Drive {

  constructor(public folder: FileSystemDirectoryHandle) { }

  async getDir(path: string[]): Promise<string[] | null> {
    const folder = await this.#getFolderForPath(path)

    const entries: string[] = []
    for await (let [name, item] of folder.entries()) {
      if (item.kind === 'directory') {
        name += '/'
      }
      else {
        name = name.replace(/\.tsx?$/, '.js')
      }
      entries.push(name)
    }
    return entries
  }

  async putDir(path: string[]): Promise<boolean> {
    throw new Error("Method not implemented.")
  }

  async delDir(path: string[]): Promise<boolean> {
    throw new Error("Method not implemented.")
  }

  async getFile(path: string[]): Promise<string | null> {
    return safely(async () => {
      const fh = await this.#getFileHandleForPath(path)
      const file = await fh?.getFile()
      return await file?.text() ?? null
    })
  }

  async putFile(path: string[], content: string): Promise<boolean> {
    return await safely(async () => {
      const fh = await this.#getFileHandleForPath(path, true)
      if (!fh) return false

      const w = await fh.createWritable({ keepExistingData: false })
      await w.write(content)
      await w.close()
      return true
    }) ?? false
  }

  async delFile(path: string[]): Promise<boolean> {
    return await safely(async () => {
      const folder = await this.#getFolderForPath(path)
      const name = this.#filename(path)
      await folder.removeEntry(name)
      return true
    }) ?? false
  }

  async #getFolderForPath(path: string[]) {
    let folder = this.folder
    for (let part of path.slice(0, -1)) {
      folder = await folder.getDirectoryHandle(part)
    }
    return folder
  }

  #filename(path: string[]) {
    return path.at(-1)!.replace(/\.js$/, '.tsx')
  }

  async #getFileHandleForPath(path: string[], create = false) {
    const folder = await this.#getFolderForPath(path)
    const name = this.#filename(path)
    return safely(() => folder.getFileHandle(name, { create }))
  }

}

async function safely<T>(fn: () => Promise<T>) {
  try { return fn() }
  catch (e) {
    console.error(e)
    return null
  }
}
