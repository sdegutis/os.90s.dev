import * as api from "/api.js"
await api.appReady

const $path = api.$<string>('')

const emptyPage = <api.Label text='[no page]' color={0x777777ff} />
const $page = api.$([emptyPage])

const browser: Browser = {
  load: str => {
    const absPrefix = `${location.origin}/fs/`
    if (str.startsWith(absPrefix)) str = str.slice(absPrefix.length)
    $path.val = str
  },
}

$path.watch(async path => {
  if (!path) $page.val = [emptyPage]
  const mod = await api.runJsFile(path)
  $page.val = [mod.default(browser)]
})

const initial = api.program.opts["file"]
if (initial) $path.val = initial

const pathModel = new api.TextModel($path.val)
const changePath = () => $path.val = pathModel.getText()

const panel = await api.sys.makePanel({ name: "browser" },
  <panel title='browser' size={{ w: 100, h: 70 }}>
    <api.PanedYA>

      <api.GroupX>
        <button>{`<`}</button>
        <button>{`>`}</button>
        <textfield length={150} onEnter={changePath} model={pathModel} />
      </api.GroupX>

      <api.Scroll
        background={0xffffff11}
        onMouseDown={function (b) { this.content.onMouseDown?.(b) }}
        onMouseMove={function (p) { this.content.onMouseMove?.(p) }}
        onMouseUp={function () { this.content.onMouseUp?.() }}
        children={$page}
      />

    </api.PanedYA>
  </panel>
)

panel.focusPanel()

export interface Browser {
  load(str: string): void
}
