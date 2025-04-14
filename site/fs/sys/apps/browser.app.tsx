import * as api from "/api.js"
await api.appReady

const $paths = api.$<string[]>([''])
const $pathi = api.$(0)
const $path = api.multiplex([$paths, $pathi], () => $paths.val[$pathi.val])

const emptyPage = <api.Center>
  <api.Label text='[no page]' color={0x777777ff} />
</api.Center>
const $page = api.$([emptyPage])

function gotoPage(path: string) {
  const i = $pathi.val + 1
  $paths.val = [...$paths.val.slice(0, i), path]
  $pathi.val = $paths.val.length - 1
}

const browser: Browser = {
  load: path => {
    const absPrefix = `${location.origin}/fs/`
    if (path.startsWith(absPrefix)) path = path.slice(absPrefix.length)
    gotoPage(path)
  },
}

$path.watch(async path => {
  if (!path) {
    $page.val = [emptyPage]
    return
  }
  const mod = await api.runJsFile(path)
  $page.val = [mod.default(browser)]
})

const pathModel = new api.TextModel($paths.val[0]!)
const goto = () => gotoPage(pathModel.getText())
$path.watch(path => {
  console.log({ path })
  return pathModel.setText(path)
})

const initial = api.program.opts["file"]
if (initial) {
  $paths.val = [...$paths.val, initial]
  $pathi.val = $paths.val.length - 1
}

function goPrev() { $pathi.val = Math.max($pathi.val - 1, 0) }
function goNext() { $pathi.val = Math.min($pathi.val + 1, $paths.val.length - 1) }

const panel = await api.sys.makePanel({ name: "browser" },
  <panel title='browser' size={{ w: 100, h: 70 }}>
    <api.PanedYA>

      <api.GroupX>
        <button action={goPrev}>{`<`}</button>
        <button action={goNext}>{`>`}</button>
        <textfield length={150} onEnter={goto} model={pathModel} />
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
