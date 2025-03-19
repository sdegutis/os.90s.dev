export class DataFile<T> {

  meta: T | null
  data: string

  constructor(contents: string) {
    const [meta, data] = this.parseMeta(contents)
    this.meta = meta
    this.data = data
  }

  private parseMeta(str: string): [T | null, string] {
    const split = str.match(/\n===+\n/)
    if (!split || split.index === undefined) return [null, str]

    const head = str.slice(0, split.index).trim()
    const rest = str.slice(split.index + split[0].length)
    const meta = Object.create(null)

    for (const line of head.split('\n')) {
      const [k, v] = (line.split(/ *= */))

      const parts = k.split('.')
      const last = parts.pop()!

      let node = meta
      for (const p of parts) {
        node = node[p] ??= Object.create(null)
      }

      node[last] = v
    }

    return [meta, rest]
  }

}
