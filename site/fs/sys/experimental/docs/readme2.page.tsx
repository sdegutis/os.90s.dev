import { DocsPage } from "./common.js"
import { fsPathOf, GroupY, Label } from "/os/api.js"
import type { Browser } from "/os/fs/sys/experimental/apps/browser.app.js"

export default (browser: Browser) => {
  return <DocsPage browser={browser} current={fsPathOf(import.meta.url)}>
    <GroupY>
      <Label text='hello world!' />
      <button action={() => {
        browser.load(import.meta.resolve('./readme.page.js'))
      }}>go back page</button>
    </GroupY>
  </DocsPage>
}
