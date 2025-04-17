import { Browser } from "../apps/browser.app.js"
import { DocsPage } from "./common.js"
import { fsPathOf, GroupY, Scroll, View } from "/api.js"

export default (browser: Browser) => {
  return <DocsPage browser={browser} current={fsPathOf(import.meta.url)}>

    {twism`

### header text ###

"" this is the first line
"" so good
"" that is the second

"" unrelated quote
""
""
"" yes, it's good?

1. this one
2. that two

- this is the first
- that is the second
- and the third
- fourth

and some code in >file< is:

> (example.tsx)
> line 2
> run()

=== section, part 2? ===

and another

asdfadf *asdf*
and [[what about](./readme2.txt)] a link


this is the top

--- section ---

cool

asfd #this is NOT a comment
just /one/ line though

`}

    {/* {twism`
      ### 90s.dev ###

      welcome to 90s.dev, a retrofuturistic dev env
      which makes programming fun again.
      
      1. its so good
      2. its really good
      3. its the best

      - what is this
      - what is that

      ### the whole thing

      hello world
      *very* cool
      
      yes it /is!/
      
      > some code
      > example
      
      and also
      
      "" some block quotes
      "" from some people
      
      ### another section${<button action={() => { }}>hi</button>} ###
      
      - very
      - good
      
      ${<button action={() => { browser.load(import.meta.resolve('./readme2.page.js')) }}>
        load other page
      </button>}
      
      * lists?
      * not sure
    `} */}
  </DocsPage>
}

class Flow extends View {

}

const compiled = new Map<TemplateStringsArray, Twism>()

function twism(array: TemplateStringsArray, ...args: any[]) {
  let fn = compiled.get(array)
  if (!fn) {
    const whole: string[] = []
    for (let i = 0; i < array.length; i++) {
      whole.push(array[i])
      whole.push(`$${i}`)
    }
    whole.pop()
    compiled.set(array, fn = new Twism(whole.join('')))
  }
  const children = toView(fn.withVars(args))
  return <Scroll background={0xffffff11}>
    <GroupY align={'a'} children={children} />
  </Scroll>
}

function toView(twism: TwismNode[]) {



  // const lines = src.split('\n')

  // return {
  //   eval() {
  //     return lines.map(line =>
  //       <GroupX gap={3} children={(line.split(/ +/)).map(word =>
  //         <Label text={word} color={
  //           line.startsWith('#') ? 0xff9900ff :
  //             word.startsWith('*') ? 0xffffffff :
  //               word.startsWith('/') ? 0xffff9999 :
  //                 0x777777ff} />)} />)
  //   }
  // }
  return <View />
}

type TwismNode =
  | { type: 'break', lines: number }
  | { type: 'variable', key: string, val: any }
  | { type: 'plain', text: string }
  | { type: 'bold', text: string }
  | { type: 'italic', text: string }
  | { type: 'code', text: string }
  | { type: 'link', text: string, path: string }
  | { type: 'bullet', text: string, number?: number }
  | { type: 'codeblock', text: string, filename?: string }
  | { type: 'quote', text: string }
  | { type: 'header', text: string }
  | { type: 'subheader', text: string }
  | { type: 'subsubheader', text: string }

class Twism {

  nodes: TwismNode[] = []
  #s: string
  #i = 0

  constructor(src: string) {
    let match
    if (match = src.match(/^(\n+)( +)/)) {
      const r = new RegExp(`\n {1,${match[2].length}}`, 'g')
      src = src.replace(r, '\n')
    }
    this.#s = src.trim().replaceAll('\r', '')
    console.log('done2', this.#s.split('\n'))
    while (this.#i < this.#s.length) {
      this.#start()
    }
    console.log('done')
    this.nodes.forEach(n => console.log(n))
  }

  withVars(vars: Record<string, any>) {
    return this.nodes.map(node => {
      if (node.type === 'variable') return { ...node, val: vars[node.key] }
      return node
    })
  }

  #start() {
    if (this.#peek(4) === '### ') return this.#header('#', this.#rh1, 'header')
    if (this.#peek(4) === '=== ') return this.#header('=', this.#rh2, 'subheader')
    if (this.#peek(4) === '--- ') return this.#header('-', this.#rh3, 'subsubheader')
    if (this.#peek(2) === '""') return this.#quote()
    if (this.#peek(1) === '>') return this.#codeblock()
    if (this.#peek(2) === '- ') return this.#listitem()
    if (this.#match(this.#rln)) return this.#listitemn()
    if (this.#match(this.#rnl)) return this.#break()
    return this.#paragraph()
  }

  #break() {
    const m = this.#consume(this.#rnl)!
    this.nodes.push({ type: 'break', lines: m.length })
  }

  #paragraph() {

    const text = this.#restline()!
    this.nodes.push({ type: 'plain', text })

    // this.#i++
  }

  #rnl = /\n+/y
  #rln = /(\d+)\. /y
  #rh1 = /[^#\n]+/y
  #rh2 = /[^=\n]+/y
  #rh3 = /[^-\n]+/y

  #header<N extends TwismNode>(tok: string, r: RegExp, type: N extends { text: string } ? N['type'] extends `${string}header` ? N['type'] : never : never) {
    this.#i += 4
    this.#skipspace()
    const text = this.#mustconsume(r, `Expected text, got ${this.#peek()}`).trimEnd()
    this.#skipspace()

    while (this.#peek() === tok) this.#i++

    const last = this.#peek()
    if (last !== '\n' && last !== undefined) {
      throw new SyntaxError(`Expected header to end with ${tok} but got: ${last}`)
    }
    this.#i++

    this.nodes.push({ type, text })

    return text
  }

  #rrl = /[^\n]+/y

  #restline() { return this.#consume(this.#rrl) }

  #quote() {
    const lines: string[] = []
    while (this.#peek(2) === '""') {
      this.#i += 2
      this.#skipspace()
      lines.push(this.#restline() ?? '')
      this.#i++
    }
    this.nodes.push({ type: 'quote', text: lines.join('\n') })
  }

  #codeblock() {
    const lines: string[] = []
    while (this.#peek() === '>') {
      this.#i += 1
      this.#skipspace()
      lines.push(this.#restline() ?? '')
      this.#i++
    }
    this.nodes.push({ type: 'codeblock', text: lines.join('\n') })
  }

  #listitem() {
    while (this.#peek(2) === '- ') {
      this.#i += 2
      const text = this.#restline()!
      this.#i++
      this.nodes.push({ type: 'bullet', text })
    }
  }

  #listitemn() {
    let m
    while (m = this.#match(this.#rln)) {
      this.#i += m[0].length
      const text = this.#restline()!
      this.#i++
      this.nodes.push({ type: 'bullet', text, number: +m[1] })
    }
  }


  #skipspace() {
    while (this.#peek() === ' ') this.#i++
  }

  #match(r: RegExp) {
    r.lastIndex = this.#i
    return r.exec(this.#s)
  }

  #consume(r: RegExp) {
    const m = this.#match(r)?.[0]
    if (m) this.#i += m.length
    return m
  }

  #mustconsume(r: RegExp, e: string) {
    const m = this.#consume(r)
    if (!m) throw new Error(e)
    return m
  }

  #peek(n = 1) { return this.#s.slice(this.#i, this.#i + n) }

}

const twisTheme1 = {
  text: 0x777777ff,
  comment: 0x00990077,
  error: 0x990000ff,
  bold: 0xffffffff,
  header: 0xff9900ff,
  headerbold: 0xffff00ff,
  italic: 0xffff9999,
  link: 0x0099ff99,
  quote: 0x9999ff99,
  bullet: 0xff99ff99,
  code: 0x00990099,
  codeblock: 0x00990099,
}
