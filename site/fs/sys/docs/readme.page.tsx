import { Browser } from "../apps/browser.app.js"
import { DocsPage } from "./common.js"
import { fsPathOf, View } from "/api.js"

export default (browser: Browser) => {
  return <DocsPage browser={browser} current={fsPathOf(import.meta.url)}>
    {lang`
      # this is a header

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

function lang(array: TemplateStringsArray, ...args: any[]) {

  for (let i = 0; i < array.length; i++) {
    const chunk = array[i]
    const arg = args[i]

    console.log([chunk])
    console.log([arg])
  }

  return <View />
}
