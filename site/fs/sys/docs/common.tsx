import { Button, GroupY, Label, PanedXA, View } from "/api.js"

export interface Browser {
  load(str: string): void
}

const pages = {
  Main: 'sys/docs/readme.page.js',
  Page2: 'sys/docs/readme2.page.js',
}

function Sidebar(data: { current: string, browser: Browser }) {
  return <GroupY align={'+'}>
    {Object.entries(pages).map(([title, path]) => {
      return <Button padding={2} onClick={() => data.browser.load(path)}>
        <Label text={title} color={data.current === path
          ? 0x0099ffff
          : 0xccccccff} />
      </Button>
    })}
  </GroupY>
}

export function DocsPage(data: { current: string, browser: Browser, children: View }) {
  return <PanedXA>
    <Sidebar current={data.current} browser={data.browser} />
    {data.children}
  </PanedXA>
}
