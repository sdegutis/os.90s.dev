class JSLNParser {

  private array
  private i = 0

  private root: Record<string, any> = {}
  private current = this.root

  constructor(str: string) {
    this.array = Array.from(str)
  }

  parse() {
    while (this.i < this.array.length) {
      this.current = this.root

      this.skipspace()

      if (this.ch() === '#') {
        while (!this.isend() && !this.isnewline()) this.i++
        continue
      }

      if (this.isnewline()) { this.i++; continue }
      if (this.isend()) break

      const key = this.buildkeys()
      const val = this.someval()

      this.current[key] = val
    }
    return this.root
  }

  private buildkeys() {
    while (true) {
      let key = this.somekey()
      this.skipspace()

      if (this.ch() === '[' && this.peek() === ']') {
        const array = this.current[key] ??= []
        key = array.length
        this.current = array
        this.i++
        this.i++
      }

      if (this.ch() === '.') {
        this.current = this.current[key] ??= {}
        this.i++
        this.skipspace()
        continue
      }
      else if (this.ch() === '=') {
        this.i++
        this.skipspace()
        return key
      }
      else {
        this.error(`Expected . or =, got ${this.ch()}`)
      }
    }
  }

  private someval() {
    if (this.isend()) this.error(`Unexpected EOS after key`)
    if (this.isnewline()) return this.multi()
    if (this.ch()!.match(/['"`]/)) return this.string(this.ch()!)
    if (this.ch() === '[') return this.inlinearray()

    const ident = this.ident()
    if (ident === 'null') return null
    if (ident === 'true') return true
    if (ident === 'false') return false

    const n = +ident
    if (ident !== 'NaN' && !isNaN(n)) return n

    this.error(`Expected value, got ${ident}`)
  }

  private inlinearray() {
    this.i++
    const vals: any[] = []
    this.skipspace()
    while (this.ch() !== ']') {
      const val = this.someval()
      vals.push(val)
      this.skipspace()
      if (this.ch() === ',') this.i++
      this.skipspace()
    }
    this.i++
    return vals
  }

  private multi() {
    this.i++
    if (this.isend()) this.error(`Expected multiline value, got EOS`)
    const delim = this.toeol()
    const lines: string[] = []
    while (!this.isend()) {
      const line = this.toeol()
      if (line === delim) break
      lines.push(line.replace(/\n$/, ''))
    }
    return lines.join('\n')
  }

  private toeol() {
    let start = this.i
    while (!this.isnewline() && !this.isend()) this.i++
    this.i++
    return this.array.slice(start, this.i).join('')
  }

  private somekey() {
    if (this.ch()!.match(/['"`]/))
      return this.string(this.ch()!)
    else
      return this.ident()
  }

  private string(term: string) {
    this.i++
    const chs = []
    while (this.ch() !== term) {
      if (this.isend()) this.error(`Unexpected EOS in string`)
      if (this.ch() === '\\') {
        this.i++
        chs.push(this.escape())
      }
      chs.push(this.ch())
      this.i++
    }
    this.i++
    return chs.join('')
  }

  private ident() {
    const chs = []
    while (this.ch()?.match(/[a-zA-Z0-9_-]/)) {
      chs.push(this.ch())
      this.i++
    }
    return chs.join('')
  }

  private escape() {
    const literals: Record<string, string> = { n: '\n', t: '\t', "'": "" }
    const ch = this.ch()!
    if (ch in literals) return literals[ch]
    this.error(`Unknown escape: ${this.ch()}`)
  }

  private error(s: string): never { throw new SyntaxError(s + '\n\n' + this.array.slice(0, this.i).join('')) }
  private skipspace() { while (this.isspace()) this.i++ }
  private ch(): string | undefined { return this.array[this.i] }
  private peek(): string | undefined { return this.array[this.i + 1] }
  private isend() { return this.ch() === undefined }
  private isnewline() { return this.ch()?.match(/[\n]/) }
  private isspace() { return this.ch()?.match(/[ \t]/) }

}

class JSLNEncoder {

  private root
  private lines: string[] = []
  private keys: string[] = []
  private stringifiers?: Record<string, (o: any) => string> | undefined

  constructor(o: Record<string, any>, stringifiers?: Record<string, (o: any) => string>) {
    this.root = o
    this.stringifiers = stringifiers
  }

  stringify() {
    this.runobj(this.root)
    return this.lines.join('\n')
  }

  private runobj(o: Record<string, any>) {
    if ('toJsln' in o && typeof o["toJsln"] === 'function') {
      o = o["toJsln"]()
    }

    const keys = [...this.keys]
    for (const [k, v] of Object.entries(o)) {
      this.keys = [...keys, this.tostr(k)]
      this.pushval(v)
    }
  }

  private pushval(o: any) {
    if (o === null) return this.finishline('null')
    if (o === true) return this.finishline('true')
    if (o === false) return this.finishline('false')
    if (typeof o === 'number') return this.finishline(o)
    if (typeof o === 'string') return this.finishline(this.toqstr(o))
    if (typeof o === 'function') return this.finishline(o())

    if (typeof o !== 'object') throw new SyntaxError(`Can't stringify object: ${o}`)

    if (o instanceof Array) {
      const lastkey = this.keys.pop() + '[]'
      this.keys.push(lastkey)
      const keys = [...this.keys]
      for (const v of o) {
        this.keys = keys
        this.pushval(v)
      }
    }
    else {
      this.runobj(o)
    }
  }

  private toqstr(o: string) {
    if (o.includes('\n')) return this.multiline(o)
    return `'${o.replace("'", "\\'")}'`
  }

  private tostr(o: string) {
    if (o.match(/^[a-zA-Z0-9_-]+$/)) return o
    return this.toqstr(o)
  }

  private multiline(o: string) {
    const lines = o.split('\n')

    const iter = maybekey()
    // ugh firefox esr
    let key: string
    while (true) {
      key = iter.next().value!
      if (!lines.includes(key)) break
    }

    lines.push(key)
    lines.unshift(key)
    lines.unshift('')

    return lines.join('\n')
  }

  private finishline(val: any) {
    const finalkey = this.keys.join('.')
    const fn = this.stringifiers?.[finalkey]
    const finalval = fn ? fn(val) : val

    this.lines.push(finalkey + '=' + finalval)
    this.keys = []
  }

}

export const JSLN = {

  parse(str: string) {
    return new JSLNParser(str).parse()
  },

  tryParse(str: string) {
    try { return new JSLNParser(str).parse() }
    catch (e) { return undefined }
  },

  stringify(o: Record<string, any>, stringifiers?: Record<string, (o: any) => string>) {
    return new JSLNEncoder(o, stringifiers).stringify()
  },

}

function* maybekey() {
  let i = 0
  do yield '='.repeat(i)
  while (++i)
}
