const $drives = $<View[]>([])

refreshDrives()

async function refreshDrives() {
  const drives = await sys.listdrives('')
  $drives.val = drives.map(d =>
    <Button padding={2} onClick={(b) => {
      if (b === 0) {
        showDir([d])
      }
      else if (b === 2) {
        const unmount = async () => {
          await sys.unmount(d)
          refreshDrives()
        }
        showMenu([
          { text: 'unmount', onClick: unmount }
        ])
      }
    }}>
      <Label text={d} />
    </Button>
  )
}

const $entries = $<View[]>([])
const $breadcrumbs = $<View[]>([])

const panel = await Panel.create(
  <PanelView title={$('filer')} size={$({ w: 150, h: 120 })}>
    <SplitXA pos={50}>
      <PanedYB>
        <View>
          <GroupY align={'+'} children={$drives} />
        </View>
        <GroupX>
          <Button padding={2} onClick={mount}>
            <Label text={'mount'} />
          </Button>
        </GroupX>
      </PanedYB>
      <PanedYA>
        <GroupX children={$breadcrumbs} />
        <Scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
          <GroupY align={'+'} children={$entries} />
        </Scroll>
      </PanedYA>
    </SplitXA>
  </PanelView>
)

panel.focusPanel()

async function showDir(full: string[]) {
  const results = await sys.listdir(full.join(''))

  $breadcrumbs.val = full.map((part, idx) =>
    <Button padding={2} onClick={() => showDir(full.slice(0, idx + 1))}>
      <Label text={part} />
    </Button>
  )

  if (results.length === 0) {
    $entries.val = [
      <Border padding={2}>
        <Label text={'[empty]'} textColor={0xffffff77} />
      </Border>
    ]
    return
  }

  $entries.val = results.map(item =>
    item.type === 'folder'
      ? <FolderItem base={full} name={item.name} />
      : <FileItem base={full} name={item.name} />
  )
}

const imgFolder = new Bitmap([0x990000ff], 1, [1])
const imgFile = new Bitmap([0x009900ff], 1, [1])

function FolderItem({ base, name }: { base: string[], name: string }) {
  return (
    <Button padding={2} onClick={() => showDir([...base, name])}>
      <GroupX gap={2}>
        <Border>
          <ImageView bitmap={imgFolder} />
        </Border>
        <Label text={name} />
      </GroupX>
    </Button>
  )
}

function FileItem({ base, name }: { base: string[], name: string }) {
  return (
    <Button padding={2} onClick={(b) => {
      const path = [...base, name].join('')
      if (b === 0) handleFile(path)
      else showMenuForFile(path)
    }}>
      <GroupX gap={2}>
        <Border>
          <ImageView bitmap={imgFile} />
        </Border>
        <Label text={name} />
      </GroupX>
    </Button>
  )
}

async function mount() {
  const name = await showPrompt('drive name?')
  if (!name) return
  await sys.mount(name)
  refreshDrives()
}

async function handleFile(path: string) {
  if (path.endsWith('.js')) {
    await sys.launch(path)
  }
  else if (path.endsWith('.font')) {
    await sys.launch('sys/apps/fontmaker.js', path)
  }
}

async function showMenuForFile(path: string) {
  showMenu([
    { text: 'edit', onClick: () => { sys.launch('sys/apps/writer.js', path) } },
  ])
}
