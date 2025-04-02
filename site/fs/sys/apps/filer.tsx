import * as api from '/api.js'
await api.sys.init(self)

const IMG_FOLDER = new api.Bitmap([0x990000ff], 1, [1])
const IMG_FILE = new api.Bitmap([0x009900ff], 1, [1])

const EMPTY = <api.Border padding={2}>
  <api.Label text={'[empty]'} textColor={0xffffff77} />
</api.Border>



const $drivesLoader = api.$(null)
const $drives = $drivesLoader.adapt(() => api.fs.drives())

const $driveButtons = $drives.adapt(drives => drives.map(d =>
  <api.Button padding={2} onClick={(b) => {
    if (b === 0) {
      $dirs.val = [d]
    }
    else if (b === 2) {
      const unmount = async () => {
        api.fs.unmount(d)
        $drivesLoader.notify()
      }
      api.showMenu([
        { text: 'unmount', onClick: unmount }
      ])
    }
  }}>
    <api.Label text={d} />
  </api.Button>
))

const $dirs = api.$(['user/'])
$dirs.equals = api.arrayEquals

const $breadcrumbs = $dirs.adapt(dirs =>
  dirs.map((part, idx) =>
    <api.Button padding={2} onClick={() => $dirs.val = dirs.slice(0, idx + 1)}>
      <api.Label text={part} />
    </api.Button>
  )
)

const $items = $dirs.adapt(dirs => api.fs.list(dirs.join('')))

const $itemButtons = $items.adapt(items => {
  if (items.length === 0) return [EMPTY]
  return items.map(item =>
    item.type === 'folder'
      ? <FolderItem base={$dirs.val} name={item.name} />
      : <FileItem base={$dirs.val} name={item.name} />
  )
})





async function newFile() {
  const name = await api.showPrompt('filename?')
  if (!name) return
  const full = [...$dirs.val, name].join('')
  api.fs.put(full, '')
  $dirs.notify()
}




const panel = await api.Panel.create({ name: 'filer' },
  <api.PanelView title={api.$('filer')} size={api.$({ w: 150, h: 120 })}>
    <api.SplitXA pos={30}>
      <Sidebar />
      <Main />
    </api.SplitXA>
  </api.PanelView>
)

panel.focusPanel()

function Main() {
  return <api.PanedYA>

    <api.GroupX $children={$breadcrumbs} />

    <api.PanedYB>
      <api.Scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
        <api.GroupY gap={-2} align={'+'} $children={$itemButtons} />
      </api.Scroll>
      <api.GroupX background={0x00000033}>
        <api.Button padding={2} onClick={newFile}>
          <api.Label text={'new file'} />
        </api.Button>
      </api.GroupX>
    </api.PanedYB>

  </api.PanedYA>
}

function Sidebar() {
  return <api.PanedYB>

    <api.View background={0x00000077}>
      <api.GroupY align={'+'} $children={$driveButtons} />
    </api.View>

    <api.GroupX background={0x00000033}>
      <api.Button padding={2} onClick={mount}>
        <api.Label text={'mount'} />
      </api.Button>
    </api.GroupX>

  </api.PanedYB>
}

function FolderItem({ base, name }: { base: string[], name: string }) {
  return (
    <api.Button padding={2} onClick={() => $dirs.val = [...base, name]}>
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

async function mount() {
  const name = await api.showPrompt('drive name?')
  if (!name) return

  const dir = await api.sys.askdir()
  if (!dir) return

  await api.fs.mount(name, dir)
  $drivesLoader.notify()
}

async function handleFile(path: string) {
  if (path.endsWith('.js')) {
    await api.sys.launch(path)
  }
  else if (path.endsWith('.font')) {
    await api.sys.launch('sys/apps/fontmaker.js', path)
  }
}

async function showMenuForFile(path: string) {
  api.showMenu([
    { text: 'edit', onClick: () => { api.sys.launch('sys/apps/writer.js', path) } },
  ])
}
