import { GroupY } from "/api.js"

export interface Browser {
  load(str: string): void
}

export default (browser: Browser) => {
  return <GroupY>
    <>hello world</>
    <button action={() => {
      browser.load(import.meta.resolve('./readme2.page.js'))
    }}>load other page</button>
  </GroupY>
}
