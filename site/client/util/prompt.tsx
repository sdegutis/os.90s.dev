import { multiplex } from "../core/ref.js"
import { Panel } from "/client/core/panel.js"
import { dragMove } from "/client/util/drag.js"
import { Textarea } from "/client/views/textarea.js"

export async function showPrompt(text: string) {
  const result = Promise.withResolvers<string | null>()

  const prompt = <label text={text} />
  const textarea = <textarea multiline={false} /> as Textarea
  const buttons = <groupx gap={2}>
    <button onClick={no} background={0x99000099} padding={2}><label text={'cancel'} /></button>
    <button onClick={ok} background={0xffffff33} padding={2}><label text={'ok'} /></button>
  </groupx>

  // prompt.$.

  textarea.onEnter = ok

  const scroll = <scroll
    showh={false}
    showv={false}
    size={multiplex([
      prompt.$.size,
      textarea.$.size,
      buttons.$.size,
    ], () => ({
      w: Math.max(buttons.size.w, prompt.size.w) - 4,
      h: textarea.size.h,
    }))}
    onMouseDown={(...args) => {
      textarea.onMouseDown(...args)
    }}
  >
    {textarea}
  </scroll>

  const dialog = <border
    canMouse
    onPanelBlur={() => {
      panel.focusPanel()
      no()
    }}
    onKeyDown={key => {
      if (key === 'Enter') ok()
      if (key === 'Escape') no()
      return true
    }}
    onMouseDown={function (b) {
      this.onMouseUp = dragMove(panel.$absmouse, panel.$point)
    }}
    background={0x000000cc} padding={1} paddingColor={0x005599ff}>
    <border padding={3}>
      <groupy align={'m'} gap={4}>
        <border padding={2}>
          {prompt}
        </border>
        <border padding={2} background={0xffffff11}>
          {scroll}
        </border>
        {buttons}
      </groupy>
    </border>
  </border>

  const panel = await Panel.create(dialog, { pos: 'center' })

  panel.focusPanel()
  dialog.focus()

  textarea.focus()

  function ok() { panel.close(); result.resolve(textarea.text) }
  function no() { panel.close(); result.resolve(null) }

  return result.promise
}
