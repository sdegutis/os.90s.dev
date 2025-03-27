import { Bitmap } from "/client/core/bitmap.js"
import { Panel } from "/client/core/panel.js"
import { program } from "/client/core/prog.js"
import { $ } from "/client/core/ref.js"
import type { FileItem, FolderItem } from "/client/core/rpc.js"
import { PanelView } from "/client/util/panelview.js"
import type { View } from "/client/views/view.js"

const drives = await program.listdrives('')

const $entries = $<View[]>([])
const $breadcrumbs = $<View[]>([])

const panel = await Panel.create(
  <PanelView title={'Filer'} size={$({ w: 150, h: 120 })}>
    <splitxa pos={50}>
      <view>
        <groupy align={'+'} children={drives.map(d =>
          <button padding={2} onClick={() => showDir([d])}>
            <label text={d} />
          </button>
        )} />
      </view>
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
  const results = await program.listdir(full.join(''))

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
      ? <FolderItem base={full} item={item} />
      : <FileItem base={full} item={item} />
  )
}

const imgFolder = new Bitmap([0x990000ff], 1, [1])
const imgFile = new Bitmap([0x009900ff], 1, [1])

function FolderItem({ base, item }: { base: string[], item: FolderItem }) {
  return (
    <button padding={2} onClick={() => showDir([...base, item.name])}>
      <groupx gap={2}>
        <border>
          <image bitmap={imgFolder} />
        </border>
        <label text={item.name} />
      </groupx>
    </button>
  )
}

function FileItem({ base, item }: { base: string[], item: FileItem }) {
  return (
    <button padding={2}>
      <groupx gap={2}>
        <border>
          <image bitmap={imgFile} />
        </border>
        <label text={item.name} />
      </groupx>
    </button>
  )
}
