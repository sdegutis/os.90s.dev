import { GroupY } from "/api.js"

export interface Browser {
  load(str: string): void
}

export default (browser: Browser) => {
  return <GroupY>
    <>hello world 2!!</>
    <button action={() => {
      browser.load(import.meta.resolve('./readme.page.js'))
    }} text='back to first page' />
  </GroupY>
}
