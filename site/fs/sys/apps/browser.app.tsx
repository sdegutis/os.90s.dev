import * as api from "/api.js"
await api.appReady

const $paths = api.$<string[]>([])
const $pathi = api.$(-1)
const $path = api.multiplex([$paths, $pathi], () => $paths.val[$pathi.val])

const emptyPage = <api.Center background={0x111111ff}>
  <api.Label text='[no page]' color={0x777777ff} />
</api.Center>
const $page = api.$<api.View>(null!)

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

$path.watch(path => {
  api.sys.noteCurrentFile(path)
  if (!path) {
    $page.val = emptyPage
    return
  }
  api.runJsFile(path).then(mod => {
    $page.val = mod.default(browser)
  }).catch(e => {
    console.error(e)
    $page.val = <api.Center>
      <api.GroupY gap={2}>
        <api.Label color={0x990000ff} text='Error loading page' />
        <api.Label text={String(e)} />
      </api.GroupY>
    </api.Center>
  })
})

const pathModel = new api.TextModel($paths.val[0]!)
const goto = () => gotoPage(pathModel.getText())
$path.watch(path => pathModel.setText(path))

gotoPage('')

const initial = api.program.opts["file"]
if (initial) gotoPage(api.program.opts["file"])

const navbar = <api.GroupX background={0x222222ff}>
  <button action={goPrev}>{`<`}</button>
  <button action={goNext}>{`>`}</button>
  <textfield length={150} onEnter={goto} model={pathModel} />
</api.GroupX>


function goPrev() { $pathi.val = Math.max($pathi.val - 1, 0) }
function goNext() { $pathi.val = Math.min($pathi.val + 1, $paths.val.length - 1) }

const panel = await api.sys.makePanel({ name: "browser" },
  <panel title='browser' size={{ w: 100, h: 70 }}>
    <api.PanedYA
      background={0x000000ff}
      gap={1}
      children={$page.adapt(page => [navbar, page])}
    />
  </panel>
)

panel.focusPanel()

export interface Browser {
  load(str: string): void
}
