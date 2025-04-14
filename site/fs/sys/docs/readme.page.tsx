import { Browser, DocsPage } from "./common.js"
import { fsPathOf, GroupY } from "/api.js"

export default (browser: Browser) => {
  return <DocsPage browser={browser} current={fsPathOf(import.meta.url)}>
    <GroupY>
      <>hello world</>
      <button action={() => {
        browser.load(import.meta.resolve('./readme2.page.js'))
      }}>load other page</button>
    </GroupY>
  </DocsPage>
}
