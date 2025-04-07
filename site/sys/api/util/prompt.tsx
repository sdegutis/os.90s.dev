import { Panel } from "../core/panel.js"
import { multiplex } from "../core/ref.js"
import { sys } from "../core/sys.js"
import { Border } from "../views/border.js"
import { Button } from "../views/button.js"
import { GroupX, GroupY } from "../views/group.js"
import { Label } from "../views/label.js"
import { Scroll } from "../views/scroll.js"
import { Textarea } from "../views/textarea.js"
import { dragMove } from "./drag.js"

export async function showPrompt(text: string) {
  const result = Promise.withResolvers<string | null>()

  const prompt = <Label text={text} />
  const textarea = <Textarea multiline={false} /> as Textarea
  const buttons = <GroupX gap={2}>
    <Button onClick={no} background={0x99000099} padding={2}><Label text={'cancel'} /></Button>
    <Button onClick={ok} background={0xffffff33} padding={2}><Label text={'ok'} /></Button>
  </GroupX>

  textarea.onEnter = ok

  const scroll = <Scroll
    showh={false}
    showv={false}
    $size={multiplex([
      prompt.$size,
      textarea.$size,
      buttons.$size,
    ], () => ({
      w: Math.max(buttons.size.w, prompt.size.w) - 4,
      h: textarea.size.h,
    }))}
    onMouseDown={(...args) => {
      textarea.onMouseDown(...args)
    }}
  >
    {textarea}
  </Scroll>

  const dialog = <Border
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
      this.onMouseUp = dragMove(sys.$mouse, panel.$point)
    }}
    background={0x222222ff} padding={1} paddingColor={0x005599ff}>
    <Border padding={3}>
      <GroupY align={'m'} gap={4}>
        <Border padding={2}>
          {prompt}
        </Border>
        <Border padding={2} background={0xffffff11}>
          {scroll}
        </Border>
        {buttons}
      </GroupY>
    </Border>
  </Border>

  const panel = await Panel.create({ name: 'prompt', pos: 'center' }, dialog)

  panel.focusPanel()
  dialog.focus()

  textarea.focus()

  function ok() { panel.close(); result.resolve(textarea.text) }
  function no() { panel.close(); result.resolve(null) }

  return result.promise
}
