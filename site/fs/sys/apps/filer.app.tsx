import api from '/api.js'
await api.appReady

const IMG_FOLDER = new api.Bitmap([0x990000ff], 1, [1])
const IMG_FILE = new api.Bitmap([0x009900ff], 1, [1])

const EMPTY = <api.Border padding={2}>
  <api.Label text={'[empty]'} color={0xffffff77} />
</api.Border>


const $drives = api.$<string[]>(api.fs.drives())

const $dirs = api.$<string[]>([])

$dirs.intercept(dirs => {
  const cdrive = $drives.$[0]
  if (!$drives.$.includes(cdrive)) return ['usr/']
  return [...dirs]
})

api.fs.watchTree('', () => {
  $drives.$ = api.fs.drives()
  $dirs.$ = [...$dirs.$]
})

const initpath = api.program.opts['file'] as string
$dirs.$ = initpath?.split('/').slice(0, -1).map(p => p + '/') ?? ['usr/']
$dirs.watch(dirs => api.sys.noteCurrentFile(dirs.join('')))

const $items = await $dirs.adaptAsync(dirs => api.fs.getDir(dirs.join('')))

const $driveButtons = $drives.adapt(drives => drives.map(d => d + '/').map(d =>
  <api.Button padding={2} onClick={(b) => {
    if (b === 0) {
      $dirs.$ = [d]
    }
    else {
      api.showMenu(panel, [
        { text: 'unmount', onClick: () => api.fs.unmount(d.slice(0, -1)) },
      ])
    }
  }}>
    <api.Label text={d} />
  </api.Button>
))

const $breadcrumbs = $dirs.adapt(dirs =>
  dirs.map((part, idx) =>
    <api.Button padding={2} onClick={() => $dirs.$ = dirs.slice(0, idx + 1)}>
      <api.Label text={part} />
    </api.Button>
  )
)

const $itemButtons = $items.adapt(items => {
  if (!items || items.length === 0) return [EMPTY]
  return items.map(name =>
    name.endsWith('/')
      ? <FolderItem base={$dirs.$} name={name} />
      : <FileItem base={$dirs.$} name={name} />
  )
})

const panel = await api.sys.makePanel({ name: 'filer' },
  <panel size={{ w: 150, h: 120 }}>
    <api.SplitXA pos={30}>
      <Sidebar />
      <Main />
    </api.SplitXA>
  </panel>
)

panel.focusPanel()

function Main() {

  function mouseDownFileArea(this: api.View, b: number) {
    if (b === 2) {
      api.showMenu(this.panel!, [
        {
          text: 'paste',
          disabled: copying === undefined,
          onClick: async () => {
            const curdir = $dirs.$.join('')
            const from = copying!

            let to = api.pathFns.adopt(curdir, api.pathFns.orphan(from)!)
            if (api.pathFns.parent(from) === curdir) {
              to = await api.fs.uniqueFilename(to)
            }

            await api.fs.copy(from, to)
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
      <api.GroupX background={0x00000033} gap={7}>
        <button action={newFile}>new file</button>
        <button action={newFolder}>new folder</button>
      </api.GroupX>
    </api.PanedYB>

  </api.PanedYA>
}

function Sidebar() {
  return <api.View background={0x00000077}>
    <api.GroupY align={'a'}>
      <api.GroupY align={'+'} children={$driveButtons} />
      <button action={async function (this: api.View) {
        const name = await api.showPrompt(this.panel!, 'drive name?')
        if (!name) return
        const folder = await api.sys.askdir()
        if (!folder) {
          console.log('Failed to get folder: error, cancelled, or using Firefox.')
          return
        }
        api.fs.mount(name, folder)
      }}>mount</button>
    </api.GroupY>
  </api.View>
}

function FolderItem({ base, name }: { base: string[], name: string }) {
  return (
    <api.Button padding={2} onClick={function (b) {
      const path = [...base, name]
      if (b === 0) $dirs.$ = path
      else showMenuForFolder(this, path.join(''))
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
    <api.Button padding={2} onClick={function (b) {
      const path = [...base, name].join('')
      if (b === 0) handleFile(path)
      else showMenuForFile(this, path)
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
    await api.sys.launch('sys/experimental/apps/browser.app.js', path)
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
    await api.sys.launch('sys/apps/editor.app.js', path)
  }
  else if (path.endsWith('.jsln')) {
    await api.sys.launch('sys/apps/editor.app.js', path)
  }
}

let copying: string | undefined

async function showMenuForFile(view: api.View, path: string) {
  api.showMenu(view.panel!, [
    { text: 'edit', onClick: () => { api.sys.launch('sys/apps/editor.app.js', path) } },
    { text: 'delete', onClick: () => { api.fs.delFile(path) } },
    { text: 'rename', onClick: () => { rename(path) } },
    { text: 'copy', onClick: () => { copying = path } },
  ])
}

async function showMenuForFolder(view: api.View, path: string) {
  api.showMenu(view.panel!, [
    { text: 'delete', onClick: () => { api.fs.delDir(path) } },
    { text: 'rename', onClick: () => { rename(path) } },
    { text: 'copy', onClick: () => { copying = path } },
  ])
}

async function rename(from: string) {
  let to = await api.showPrompt(panel, 'new path?')
  if (!to) return
  await api.fs.move(from, to)
}

async function newFile() {
  const name = await api.showPrompt(panel, 'file name?')
  if (!name) return
  const full = [...$dirs.$, name].join('')
  await api.fs.putFile(full, '')
}

async function newFolder() {
  const name = await api.showPrompt(panel, 'folder name?')
  if (!name) return
  const full = [...$dirs.$, name].join('')
  await api.fs.putDir(full)
}
