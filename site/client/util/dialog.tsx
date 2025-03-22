import type { Program } from "../core/prog.js"
import { dragMove } from "./drag.js"

export async function showDialog(prog: Program, text: string) {
  const result = Promise.withResolvers()

  const dialog = <border
    passthrough={false}
    onPanelBlur={no}
    canFocus={true}
    onKeyDown={key => {
      if (key === 'Enter') ok()
      if (key === 'Escape') no()
    }}
    onMouseDown={function (b, pos) {
      this.onMouseMove = dragMove(pos, panel)
      this.onMouseUp = () => delete this.onMouseMove
    }}
    background={0x000000cc} padding={1} borderColor={0x005599ff}>
    <border padding={3}>
      <groupy align={'z'} gap={4}>
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

  const panel = await prog.makePanel({
    size: dialog.$ref('size'),
    pos: 'center',
    view: dialog,
  })

  panel.focus()
  dialog.focus()

  function ok() { panel.close(); result.resolve(true) }
  function no() { panel.close(); result.resolve(false) }

  return result.promise
}
