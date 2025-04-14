import type { Panel } from "../core/panel.js"
import { multiplex, Ref } from "../core/ref.js"
import { program, sys } from "../core/sys.js"
import { fs } from "../fs/fs.js"
import { showPrompt } from "../util/prompt.js"
import { PanelViewComp } from "./panel.js"

export interface FilePanelFileRep {
  $path: Ref<string | undefined>,
  getContents: () => string,
}

export function FilePanelComp({
  file,
  menuItems,
  onKeyPress,
  presented,
  ...data
}: Parameters<typeof PanelViewComp>[0] & {
  file: FilePanelFileRep,
}) {
  let panel: Panel

  async function load() {
    const path = await showPrompt(panel, 'file path?')
    if (!path) return
    sys.launch(program.opts["app"], path)
  }

  async function save() {
    if (!file.$path.val) return saveAs()
    fs.putFile(file.$path.val, file.getContents())
  }

  async function saveAs() {
    const path = await askFilePath()
    if (!path) return
    file.$path.val = path
    fs.putFile(file.$path.val, file.getContents())
    sys.noteCurrentFile(file.$path.val)
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

  return <panel
    {...data}
    presented={(p: Panel) => {
      panel = p
      presented?.(p)

      const $name = p.$name
      p.$name = multiplex([file.$path, $name], () => {
        return `${$name.val}: ${file.$path.val ?? '[no file]'}`
      })

    }}
    onKeyPress={keyHandler}
    menuItems={fileMenu}
  />
}
