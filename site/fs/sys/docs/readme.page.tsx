import { Browser } from "../apps/browser.app.js"
import { DocsPage } from "./common.js"
import { fsPathOf, Label } from "/api.js"

export default (browser: Browser) => {
  return <DocsPage browser={browser} current={fsPathOf(import.meta.url)}>
    <>
      hello
      {'\n'}
      how are you?


      <Label text={'hi'} />
      <Label text={'ho'} />
      <>hello world</>

      this is cool
      <button action={() => {
        browser.load(import.meta.resolve('./readme2.page.js'))
      }}>load other page</button>
    </>
  </DocsPage>
}
