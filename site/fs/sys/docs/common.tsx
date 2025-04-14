import { type Browser } from "../apps/browser.app.js"
import { Button, GroupY, Label, Scroll, SplitXA, View } from "/api.js"

const pages = {
  Main: 'sys/docs/readme.page.js',
  Page2: 'sys/docs/readme2.page.js',
}

function Sidebar(data: { current: string, browser: Browser }) {
  return <Scroll background={0x00000033} showh={false}>
    <GroupY align={'+'}>
      {Object.entries(pages).map(([title, path]) => {
        return <Button padding={2} onClick={() => data.browser.load(path)}>
          <Label text={title} color={data.current === path
            ? 0x0099ffff
            : 0xccccccff} />
        </Button>
      })}
    </GroupY>
  </Scroll>
}

export function DocsPage(data: { current: string, browser: Browser, children: View }) {
  return <SplitXA pos={30}>
    <Sidebar current={data.current} browser={data.browser} />
    {data.children}
  </SplitXA>
}
