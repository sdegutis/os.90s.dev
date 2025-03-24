import { program } from "../core/prog.js"
import { dragMove } from "./drag.js"

export async function showDialog(text: string) {
  const result = Promise.withResolvers<boolean>()

  const dialog = <border
    passthrough={false}
    onPanelBlur={() => {
      panel.focus()
      no()
    }}
    canFocus={true}
    onKeyDown={key => {
      if (key === 'Enter') ok()
      if (key === 'Escape') no()
      return true
    }}
    onMouseDown={function (b) {
      this.onMouseMove = dragMove(panel.absmouse, panel)
      this.onMouseUp = () => delete this.onMouseMove
    }}
    background={0x000000cc} padding={1} paddingColor={0x005599ff}>
    <border padding={3}>
      <groupy align={'m'} gap={4}>
        <border padding={2}>
          <label text={text} />
        </border>
        <groupx gap={2}>
          <button onClick={no} background={0x99000099} padding={2}><label text={'cancel'} /></button>
          <button onClick={ok} background={0xffffff33} padding={2}><label text={'ok'} /></button>
        </groupx>
      </groupy>
    </border>
  </border>

  const panel = await program.makePanel({
    size: dialog.$.size,
    pos: 'center',
    view: dialog,
  })

  panel.focus()
  dialog.focus()

  function ok() { panel.close(); result.resolve(true) }
  function no() { panel.close(); result.resolve(false) }

  return result.promise
}
