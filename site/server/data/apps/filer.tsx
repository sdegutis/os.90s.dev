import { sys } from "../../../client/core/sys.js"
import { Bitmap } from "/client/core/bitmap.js"
import { Panel } from "/client/core/panel.js"
import { $ } from "/client/core/ref.js"
import { showMenu } from "/client/util/menu.js"
import { PanelView } from "/client/util/panelview.js"
import { showPrompt } from "/client/util/prompt.js"
import type { View } from "/client/views/view.js"

const $drives = $<View[]>([])

refreshDrives()

async function refreshDrives() {
  const drives = await sys.listdrives('')
  $drives.val = drives.map(d =>
    <button padding={2} onClick={(b) => {
      if (b === 0) {
        showDir([d])
      }
      else if (b === 2) {
        const unmount = async () => {
          await sys.unmount(d)
          refreshDrives()
        }
        showMenu(panel.absmouse, [
          { text: 'unmount', onClick: unmount }
        ])
      }
    }}>
      <label text={d} />
    </button>
  )
}

const $entries = $<View[]>([])
const $breadcrumbs = $<View[]>([])

const panel = await Panel.create(
  <PanelView title={'Filer'} size={$({ w: 150, h: 120 })}>
    <splitxa pos={50}>
      <panedyb>
        <view>
          <groupy align={'+'} children={$drives} />
        </view>
        <groupx>
          <button padding={2} onClick={mount}>
            <label text={'mount'} />
          </button>
        </groupx>
      </panedyb>
      <panedya>
        <groupx children={$breadcrumbs} />
        <scroll background={0xffffff11} onMouseDown={function (b) { this.content.onMouseDown?.(b) }}>
          <groupy align={'+'} children={$entries} />
        </scroll>
      </panedya>
    </splitxa>
  </PanelView>
)

panel.focusPanel()

async function showDir(full: string[]) {
  const results = await sys.listdir(full.join(''))

  $breadcrumbs.val = full.map((part, idx) =>
    <button padding={2} onClick={() => showDir(full.slice(0, idx + 1))}>
      <label text={part} />
    </button>
  )

  if (results.length === 0) {
    $entries.val = [
      <border padding={2}>
        <label text={'[empty]'} textColor={0xffffff77} />
      </border>
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
    <button padding={2} onClick={() => showDir([...base, name])}>
      <groupx gap={2}>
        <border>
          <image bitmap={imgFolder} />
        </border>
        <label text={name} />
      </groupx>
    </button>
  )
}

function FileItem({ base, name }: { base: string[], name: string }) {
  return (
    <button padding={2} onClick={() => handleFile([...base, name].join(''))}>
      <groupx gap={2}>
        <border>
          <image bitmap={imgFile} />
        </border>
        <label text={name} />
      </groupx>
    </button>
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
