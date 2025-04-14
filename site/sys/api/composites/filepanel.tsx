import type { Panel } from "../core/panel.js"
import { defRef, multiplex, Ref } from "../core/ref.js"
import { program, sys } from "../core/sys.js"
import { fs } from "../fs/fs.js"
import { showPrompt } from "../util/prompt.js"
import { PanelViewComp } from "./panel.js"

export function FilePanelComp({
  filepath,
  filedata,
  title,
  menuItems,
  onKeyPress,
  presented,
  ...data
}: Parameters<typeof PanelViewComp>[0] & {
  filepath: Ref<string | undefined>,
  filedata: () => string,
}) {
  let panel: Panel

  async function load() {
    const path = await showPrompt(panel, 'file path?')
    if (!path) return
    sys.launch(program.opts["app"], path)
  }

  async function save() {
    if (!filepath.val) return saveAs()
    fs.putFile(filepath.val, filedata())
  }

  async function saveAs() {
    const path = await askFilePath()
    if (!path) return
    filepath.val = path
    fs.putFile(filepath.val, filedata())
    sys.noteCurrentFile(filepath.val)
  }

  async function askFilePath() {
    return await showPrompt(panel, 'file path?') ?? undefined
  }

  const fileMenu = () => {
    const items = menuItems?.() ?? []
    if (items.length > 0) {
      items.push('-')
    }
    items.push(
      { text: 'load...', onClick: load },
      { text: 'save as...', onClick: saveAs },
      { text: 'save', onClick: save },
    )
    return items
  }

  const keyHandler = (key: string) => {
    if (key === 'ctrl o') { load(); return true }
    if (key === 'ctrl s') { save(); return true }
    if (key === 'ctrl S') { saveAs(); return true }
    return onKeyPress?.(key) ?? false
  }

  const $title = defRef(title)

  const filetitle = multiplex([filepath, $title], () => {
    return `${$title.val}: ${filepath.val ?? '[no file]'}`
  })

  return <panel
    {...data}
    presented={(p: Panel) => {
      panel = p
      presented?.(p)
    }}
    onKeyPress={keyHandler}
    title={filetitle}
    menuItems={fileMenu}
  />
}
