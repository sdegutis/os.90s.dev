import { program } from "../core/prog.js"
import type { Textarea } from "../views/textarea.js"
import { dragMove } from "./drag.js"
import { multiplex } from "./ref.js"

export async function showPrompt(text: string) {
  const result = Promise.withResolvers<string | null>()

  const prompt = <label text={text} />
  const textarea = <textarea multiline={false} /> as Textarea

  textarea.onEnter = ok

  const scroll = <scroll
    showh={false}
    showv={false}
    size={multiplex([
      prompt.$ref('size'),
      textarea.$ref('size'),
    ], () => ({
      w: prompt.size.w,
      h: textarea.size.h,
    }))}
  >
    {textarea}
  </scroll>

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
    }}
    onMouseDown={function (b, pos) {
      this.onMouseMove = dragMove(pos, panel)
      this.onMouseUp = () => delete this.onMouseMove
    }}
    background={0x000000cc} padding={1} borderColor={0x005599ff}>
    <border padding={3}>
      <groupy align={'z'} gap={4}>
        <border padding={2}>
          {prompt}
        </border>
        <border padding={2} background={0xffffff11}>
          {scroll}
        </border>
        <groupx gap={2}>
          <button onClick={no} background={0x99000099} padding={2}><label text={'cancel'} /></button>
          <button onClick={ok} background={0xffffff33} padding={2}><label text={'ok'} /></button>
        </groupx>
      </groupy>
    </border>
  </border>

  const panel = await program.makePanel({
    size: dialog.$ref('size'),
    pos: 'center',
    view: dialog,
  })

  panel.focus()
  dialog.focus()

  textarea.focus()

  function ok() { panel.close(); result.resolve(textarea.text) }
  function no() { panel.close(); result.resolve(null) }

  return result.promise
}
