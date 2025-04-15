import { Browser } from "../apps/browser.app.js"
import { DocsPage } from "./common.js"
import { fsPathOf, GroupX, GroupY, Label, Scroll, View } from "/api.js"

export default (browser: Browser) => {
  return <DocsPage browser={browser} current={fsPathOf(import.meta.url)}>
    {lang`
      # this is a header

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

function lang(array: TemplateStringsArray, ...args: any[]) {
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
  return <Scroll>
    <GroupY align={'a'} children={children} />
  </Scroll>
}

function compile(src: string): Template {
  let match
  if (match = src.match(/^(\n+)( +)/)) {
    const r = new RegExp(`\n {1,${match[2].length}}`, 'g')
    src = src.replace(r, '\n')
  }
  src = src.trim()

  const lines = src.split('\n')

  return {
    eval() {
      return lines.map(line =>
        <GroupX gap={3} children={(line.split(/ +/)).map(word =>
          <Label text={word} color={
            line.startsWith('#') ? 0x999900ff :
              word.startsWith('*') ? 0x009900ff :
                word.startsWith('/') ? 0x009999ff :
                  0xccccccff} />)} />)
    }
  }
}
