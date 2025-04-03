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
    console.log('done')
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
        console.log(this.array, this.i, this.array.slice(0, this.i))
        this.error(`Expected . or =, got ${this.ch()}`)
      }
    }
  }

  private someval() {
    if (this.isend()) this.error(`Unexpected EOS after key`)
    if (this.isnewline()) return this.multi()
    if (this.ch()!.match(/['"`]/)) return this.string(this.ch()!)

    const ident = this.ident()
    if (ident === 'null') return null
    if (ident === 'true') return true
    if (ident === 'false') return false

    const n = +ident
    if (ident !== 'NaN' && !isNaN(n)) return n

    this.error(`Expected value, got ${ident}`)
  }

  private multi() {
    this.i++
    if (this.isend()) this.error(`Expected multiline value, got EOS`)
    const delim = this.toeol()
    const lines: string[] = []
    while (!this.isend()) {
      const line = this.toeol()
      if (line === delim) break
      lines.push(line)
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
    const literals: Record<string, string> = { n: '\n', r: '\r', t: '\t' }
    const ch = this.ch()!
    if (ch in literals) return literals[ch]
    this.error(`Unknown escape: ${this.ch()}`)
  }

  private error(s: string): never { throw new SyntaxError(s) }
  private skipspace() { while (this.isspace()) this.i++ }
  private ch(): string | undefined { return this.array[this.i] }
  private peek(): string | undefined { return this.array[this.i + 1] }
  private isend() { return this.ch() === undefined }
  private isnewline() { return this.ch()?.match(/[\r\n]/) }
  private isspace() { return this.ch()?.match(/[ \t]/) }

}

export class JSLN {

  static parse(str: string) {
    return new JSLNParser(str).parse()
  }

  static stringify(o: Record<string, any>) {

  }

}

console.log(JSLN.parse(`
colors[]=0xffffffff
colors[]=0x99000099
colors[]=0x000000ff
bar='hello😭world'
pixels=
===
1 1 1 0 1 1 1 0 1 1 0 0 0 1 1 0 0 1 0 0 1 0 1 0 1 0 1 0 1 1 1 0 0 1 0 0 0 1 0 0 1 0 0 0 0 1 0 0 0 1 0 0 0 1 0 0 0 0 0 0 0 1 0 0
1 0 0 0 0 0 1 0 1 0 1 0 1 1 1 0 0 1 0 0 1 1 1 0 0 1 0 0 1 1 1 0 1 0 1 0 0 1 0 0 1 1 1 0 0 1 1 0 0 1 0 0 1 1 0 0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 2
`.slice(1)))

// console.log(JSLN.parse(`
//   compilerOptions.lib[]="esnext"
//   compilerOptions.lib[]="dom"
//   compilerOptions.lib[]="dom.iterable"
//   compilerOptions.types[]="node"
//   #comment
// colors[]=0x000000ff
// colors[]=0x0000007f
// colors[]=0x00000001
// colors[]=0x00000009
// colors[]=0x00000010
// colors[]=0x0000001f
// colors[]=0x00000020
// pixels = 
// ===
// yesfasdf
// asdff
// df
// ===
// compilerOptions.moduleDetection="force"
// compilerOptions.paths."/api.js"[]="./site.api.js"
// `.trimStart()))
