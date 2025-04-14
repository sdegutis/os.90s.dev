import { Browser } from "../apps/browser.app.js"
import { DocsPage } from "./common.js"
import { fsPathOf, GroupY } from "/api.js"

export default (browser: Browser) => {
  return <DocsPage browser={browser} current={fsPathOf(import.meta.url)}>
    <GroupY>
      <>hello world 2</>
      <button action={() => {
        browser.load(import.meta.resolve('./readme.page.js'))
      }}>go back page</button>
    </GroupY>
  </DocsPage>
}
