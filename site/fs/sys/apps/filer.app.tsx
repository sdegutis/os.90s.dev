import * as api from '/api.js'
await api.appReady

const IMG_FOLDER = new api.Bitmap([0x990000ff], 1, [1])
const IMG_FILE = new api.Bitmap([0x009900ff], 1, [1])

const EMPTY = <api.Border padding={2}>
  <api.Label text={'[empty]'} color={0xffffff77} />
</api.Border>


const $drives = api.$<string[]>(api.fs.drives())

const $dirs = api.$<string[]>([])
api.fs.watchTree('', () => $dirs.val = [...$dirs.val])

const initpath = api.program.opts['file'] as string
$dirs.val = initpath?.split('/').slice(0, -1).map(p => p + '/') ?? ['usr/']
$dirs.watch(dirs => api.sys.noteCurrentFile(dirs.join('')))

const $items = await $dirs.adaptAsync(dirs => api.fs.getDir(dirs.join('')))

const $driveButtons = $drives.adapt(drives => drives.map(d => d + '/').map(d =>
  <api.Button padding={2} onClick={(b) => {
    if (b === 0) {
      $dirs.val = [d]
    }
  }}>
    <api.Label text={d} />
  </api.Button>
))

const $breadcrumbs = $dirs.adapt(dirs =>
  dirs.map((part, idx) =>
    <api.Button padding={2} onClick={() => $dirs.val = dirs.slice(0, idx + 1)}>
      <api.Label text={part} />
    </api.Button>
  )
)

const $itemButtons = $items.adapt(items => {
  if (items.length === 0) return [EMPTY]
  return items.map(name =>
    name.endsWith('/')
      ? <FolderItem base={$dirs.val} name={name} />
      : <FileItem base={$dirs.val} name={name} />
  )
})

const panel = await api.sys.makePanel({ name: 'filer' },
  <panel title='filer' size={{ w: 150, h: 120 }}>
    <api.SplitXA pos={30}>
      <Sidebar />
      <Main />
    </api.SplitXA>
  </panel>
)

panel.focusPanel()

function Main() {

  function mouseDownFileArea(b: number) {
    if (b === 2) {
      api.showMenu([
        {
          text: 'paste',
          disabled: copying === undefined,
          onClick: async () => {
            const curdir = $dirs.val.join('')
            await api.fs.copy(copying!, curdir)
            copying = undefined
          }
        },
      ])
    }
  }

  return <api.PanedYA>

    <api.GroupX>{$breadcrumbs}</api.GroupX>

    <api.PanedYB>
      <api.Scroll background={0xffffff11} onMouseDown={mouseDownFileArea}>
        <api.GroupY gap={-2} align={'+'} children={$itemButtons} />
      </api.Scroll>
      <api.GroupX background={0x00000033}>
        <button action={newFile}>new file</button>
        <button action={newFolder}>new folder</button>
      </api.GroupX>
    </api.PanedYB>

  </api.PanedYA>
}

function Sidebar() {
  return <api.View background={0x00000077}>
    <api.GroupY align={'+'} children={$driveButtons} />
  </api.View>
}

function FolderItem({ base, name }: { base: string[], name: string }) {
  return (
    <api.Button padding={2} onClick={(b) => {
      const path = [...base, name]
      if (b === 0) $dirs.val = path
      else showMenuForFolder(path.join(''))
    }}>
      <api.GroupX gap={2}>
        <api.Border>
          <api.ImageView bitmap={IMG_FOLDER} />
        </api.Border>
        <api.Label text={name} />
      </api.GroupX>
    </api.Button>
  )
}

function FileItem({ base, name }: { base: string[], name: string }) {
  return (
    <api.Button padding={2} onClick={(b) => {
      const path = [...base, name].join('')
      if (b === 0) handleFile(path)
      else showMenuForFile(path)
    }}>
      <api.GroupX gap={2}>
        <api.Border>
          <api.ImageView bitmap={IMG_FILE} />
        </api.Border>
        <api.Label text={name} />
      </api.GroupX>
    </api.Button>
  )
}

async function handleFile(path: string) {
  if (path.endsWith('.page.js')) {
    await api.sys.launch('sys/apps/browser.app.js', path)
  }
  else if (path.endsWith('.app.js')) {
    await api.sys.launch(path)
  }
  else if (path.endsWith('.js')) {
    await api.runJsFile(path)
  }
  else if (path.endsWith('.font')) {
    await api.sys.launch('sys/apps/fontmaker.app.js', path)
  }
  else if (path.endsWith('.txt')) {
    await api.sys.launch('sys/apps/writer.app.js', path)
  }
}

let copying: string | undefined

async function showMenuForFile(path: string) {
  api.showMenu([
    { text: 'edit', onClick: () => { api.sys.launch('sys/apps/writer.app.js', path) } },
    { text: 'delete', onClick: () => { api.fs.delFile(path) } },
    { text: 'copy', onClick: () => { copying = path } },
  ])
}

async function showMenuForFolder(path: string) {
  api.showMenu([
    { text: 'delete', onClick: () => { api.fs.delDir(path) } },
    { text: 'copy', onClick: () => { copying = path } },
  ])
}

async function newFile() {
  const name = await api.showPrompt(panel, 'file name?')
  if (!name) return
  const full = [...$dirs.val, name].join('')
  await api.fs.putFile(full, '')
}

async function newFolder() {
  const name = await api.showPrompt(panel, 'folder name?')
  if (!name) return
  const full = [...$dirs.val, name].join('')
  await api.fs.putDir(full)
}
