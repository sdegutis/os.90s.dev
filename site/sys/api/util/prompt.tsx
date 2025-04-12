import { Panel } from "../core/panel.js"
import { multiplex } from "../core/ref.js"
import { Border } from "../views/border.js"
import { Button } from "../views/button.js"
import { Center } from "../views/center.js"
import { GroupX, GroupY } from "../views/group.js"
import { Label } from "../views/label.js"
import { Scroll } from "../views/scroll.js"
import { TextBox } from "../views/textbox.js"

export async function showPrompt(panel: Panel, text: string) {
  const result = Promise.withResolvers<string | null>()

  const prompt = <Label text={text} />
  const textarea = <TextBox autofocus onEnter={ok} /> as TextBox
  const buttons = <GroupX gap={2}>
    <Button onClick={no} background={0x99000099} padding={2}><Label text={'cancel'} /></Button>
    <Button onClick={ok} background={0xffffff33} padding={2}><Label text={'ok'} /></Button>
  </GroupX>

  const scroll = <Scroll
    showh={false}
    showv={false}
    size={multiplex([
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
    onKeyPress={key => {
      if (key === 'enter') ok()
      if (key === 'escape') no()
      return true
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

  const host = <Center
    canMouse
    size={panel.root.$size}
    background={0x00000077}
    onMouseDown={no}
  >{dialog}</Center>

  const close = () => panel.root.children = panel.root.children.filter(c => c !== host)
  function ok() { close(); result.resolve(textarea.model.getText()) }
  function no() { close(); result.resolve(null) }

  panel.root.children = [...panel.root.children, host]

  return result.promise
}
