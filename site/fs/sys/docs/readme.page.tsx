import { Browser } from "../apps/browser.app.js"
import { DocsPage } from "./common.js"
import { fsPathOf, View } from "/api.js"

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

  override adjust(): void {
    const w = this.parent?.size.w
    console.log('in here', w)
  }

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
  return <View children={children} />
}

function compile(src: string): Template {
  let match
  if (match = src.match(/^(\n+)( +)/)) {
    console.log(match)
    const r = new RegExp(`\n {1,${match[2].length}}`, 'g')
    src = src.replace(r, '\n')
  }
  src = src.trim()

  console.log(src.split('\n'))

  return { eval() { return [] } }
}
