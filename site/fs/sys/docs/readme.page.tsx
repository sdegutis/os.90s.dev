import { Browser, DocsPage } from "./common.js"
import { fsPathOf, Grid, Label } from "/api.js"

export default (browser: Browser) => {
  return <DocsPage browser={browser} current={fsPathOf(import.meta.url)}>
    <Grid xgap={2} ygap={4} flow>
      <Label text={'hi'} />
      <Label text={'ho'} />
      <>hello world</>
      <button action={() => {
        browser.load(import.meta.resolve('./readme2.page.js'))
      }}>load other page</button>
    </Grid>
  </DocsPage>
}
