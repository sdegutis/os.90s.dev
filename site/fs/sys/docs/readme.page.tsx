import { Browser } from "../apps/browser.app.js"
import { DocsPage } from "./common.js"
import { fsPathOf, GroupX, GroupY, Label, Scroll, View } from "/api.js"

export default (browser: Browser) => {
  return <DocsPage browser={browser} current={fsPathOf(import.meta.url)}>
    {twism`
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
    `}
  </DocsPage>
}

class Flow extends View {

}

interface Template {
  eval(data: any): View[]
}

const compiled = new Map<TemplateStringsArray, Template>()

function twism(array: TemplateStringsArray, ...args: any[]) {
  let fn = compiled.get(array)
  if (!fn) {
    const whole: string[] = []
    for (let i = 0; i < array.length; i++) {
      whole.push(array[i])
      whole.push(`$${i}`)
    }
    whole.pop()
    compiled.set(array, fn = compile(whole.join('')))
  }
  const children = fn.eval(args)
  return <Scroll background={0xffffff11}>
    <GroupY align={'a'} children={children} />
  </Scroll>
}

type TwismNode =
  | { type: 'break' }
  | { type: 'variable', key: string }
  | { type: 'plain', text: string }
  | { type: 'bold', text: string }
  | { type: 'italic', text: string }
  | { type: 'code', text: string }
  | { type: 'link', text: string, path: string }
  | { type: 'bullet', text: string, number?: number }
  | { type: 'codeblock', text: string }
  | { type: 'quote', text: string }
  | { type: 'header', text: string }
  | { type: 'subheader', text: string }
  | { type: 'subsubheader', text: string }

class Twism {

  static compile(src: string): Twism {
    return new Twism()
  }

  replaceVariables() {

  }

}

function compile(src: string): Template {
  let match
  if (match = src.match(/^(\n+)( +)/)) {
    const r = new RegExp(`\n {1,${match[2].length}}`, 'g')
    src = src.replace(r, '\n')
  }
  src = src.trim().replaceAll('\r', '')

  console.log(src)

  const lines = src.split('\n')

  return {
    eval() {
      return lines.map(line =>
        <GroupX gap={3} children={(line.split(/ +/)).map(word =>
          <Label text={word} color={
            line.startsWith('#') ? 0xff9900ff :
              word.startsWith('*') ? 0xffffffff :
                word.startsWith('/') ? 0xffff9999 :
                  0x777777ff} />)} />)
    }
  }
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
  code: 0xff99ff99,
  codeblock: 0x00990099,
}
