import * as api from '/api.js'

const $dirs = api.$(['user/'])
$dirs.equals = api.arrayEquals


const $drives = api.$<api.View[]>([])

refreshDrives()

async function newFile() {
  const name = await api.showPrompt('filename?')
  const full = [...$dirs.val, name].join('')
  await api.sys.putfile(full, '')
  showDir()
}

async function refreshDrives() {
  const drives = await api.sys.listdrives('')
  $drives.val = drives.map(d =>
    <api.Button padding={2} onClick={(b) => {
      if (b === 0) {
        $dirs.val = [d]
      }
      else if (b === 2) {
        const unmount = async () => {
          await api.sys.unmount(d)
          refreshDrives()
        }
        api.showMenu([
          { text: 'unmount', onClick: unmount }
        ])
      }
    }}>
      <api.Label text={d} />
    </api.Button>
  )
}

const $entries = api.$<api.View[]>([])
const $breadcrumbs = api.$<api.View[]>([])

const panel = await api.Panel.create(
  <api.PanelView name="filer" title={api.$('filer')} size={api.$({ w: 150, h: 120 })}>
    <api.SplitXA pos={50}>
      <api.PanedYB>
        <api.View>
          <api.GroupY align={'+'} children={$drives} />
        </api.View>
        <api.GroupX>
          <api.Button padding={2} onClick={mount}>
            <api.Label text={'mount'} />
          </api.Button>
        </api.GroupX>
      </api.PanedYB>
      <api.PanedYA>
        <api.GroupX children={$breadcrumbs} />
        <api.PanedYB>
          <api.Scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
            <api.GroupY align={'+'} children={$entries} />
          </api.Scroll>
          <api.GroupX>
            <api.Button padding={2} onClick={newFile}>
              <api.Label text={'new file'} />
            </api.Button>
          </api.GroupX>
        </api.PanedYB>
      </api.PanedYA>
    </api.SplitXA>
  </api.PanelView>
)


$dirs.watch(showDir)
showDir()

panel.focusPanel()

async function showDir() {
  const full = $dirs.val

  const items = await api.sys.listdir(full.join(''))

  $breadcrumbs.val = full.map((part, idx) =>
    <api.Button padding={2} onClick={() => $dirs.val = full.slice(0, idx + 1)}>
      <api.Label text={part} />
    </api.Button>
  )

  if (items.length === 0) {
    $entries.val = [
      <api.Border padding={2}>
        <api.Label text={'[empty]'} textColor={0xffffff77} />
      </api.Border>
    ]
    return
  }

  $entries.val = items.map(item =>
    item.type === 'folder'
      ? <FolderItem base={full} name={item.name} />
      : <FileItem base={full} name={item.name} />
  )
}

const imgFolder = new api.Bitmap([0x990000ff], 1, [1])
const imgFile = new api.Bitmap([0x009900ff], 1, [1])

function FolderItem({ base, name }: { base: string[], name: string }) {
  return (
    <api.Button padding={2} onClick={() => $dirs.val = [...base, name]}>
      <api.GroupX gap={2}>
        <api.Border>
          <api.ImageView bitmap={imgFolder} />
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
          <api.ImageView bitmap={imgFile} />
        </api.Border>
        <api.Label text={name} />
      </api.GroupX>
    </api.Button>
  )
}

async function mount() {
  const name = await api.showPrompt('drive name?')
  if (!name) return
  await api.sys.mount(name)
  refreshDrives()
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
