import api from "/os/api.js"
await api.preludesFinished

const $paths = api.$<string[]>([])
const $pathi = api.$(-1)
const $path = api.multiplex([$paths, $pathi], (ps, i) => ps[i])

const emptyPage = <api.Center background={0x111111ff}>
  <api.Label text='[no page]' color={0x777777ff} />
</api.Center>
const $page = api.$<api.View>(null!)

function gotoPage(path: string) {
  const i = $pathi.val + 1
  $paths.set([...$paths.val.slice(0, i), path])
  $pathi.set($paths.val.length - 1)
}

const browser: Browser = {
  load: path => {
    const absPrefix = `${location.origin}/os/fs/`
    if (path.startsWith(absPrefix)) path = path.slice(absPrefix.length)
    gotoPage(path)
  },
}

$path.watch(path => {
  api.sys.noteCurrentFile(path)
  if (!path) {
    $page.set(emptyPage)
    return
  }
  import('/os/fs/' + path).then(mod => {
    $page.set(mod.default(browser))
  }).catch(e => {
    console.error(e)
    $page.set(<api.Center>
      <api.GroupY gap={2}>
        <api.Label color={0x990000ff} text='Error loading page' />
        <api.Label text={String(e)} />
      </api.GroupY>
    </api.Center>)
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


function goPrev() { $pathi.set(Math.max($pathi.val - 1, 0)) }
function goNext() { $pathi.set(Math.min($pathi.val + 1, $paths.val.length - 1)) }

const panel = await api.sys.makePanel({ name: "browser" },
  <panel size={{ w: 100, h: 70 }}>
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
