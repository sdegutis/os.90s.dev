import { Panel } from "../core/panel.js"
import { TextModel } from "../text/model.js"
import { Border } from "../views/border.js"
import { Center } from "../views/center.js"
import { GroupX, GroupY } from "../views/group.js"
import { dragMove } from "./drag.js"

export async function showPrompt(panel: Panel, text: string) {
  const result = Promise.withResolvers<string | null>()

  const model = new TextModel()

  const prompt = <>{text}</>
  const buttons = <GroupX gap={2}>
    <button action={no} style='cancel' text={'cancel'} />
    <button action={ok} style='submit' text={'ok'} />
  </GroupX>

  const length = Math.max(buttons.size.w, prompt.size.w)
  const field = <textfield length={length} model={model} autofocus onEnter={ok} />

  const host = <Center
    canMouse
    size={panel.root.$size}
    background={0x00000077}
    onMouseDown={no}
  >
    <Border
      canMouse
      onMouseDown={function () {
        this.onMouseUp = dragMove(panel.$mouse, this.$point)
      }}
      onKeyPress={key => {
        if (key === 'enter') ok()
        if (key === 'escape') no()
        return true
      }}
      background={0x222222ff} padding={1} paddingColor={0x005599ff}
    >
      <Border padding={3}>
        <GroupY align={'m'} gap={4}>
          <Border padding={2}>
            {prompt}
          </Border>
          {field}
          {buttons}
        </GroupY>
      </Border>
    </Border>
  </Center>

  const close = () => panel.root.children = panel.root.children.filter(c => c !== host)
  function ok() { close(); result.resolve(model.getText()) }
  function no() { close(); result.resolve(null) }

  panel.root.children = [...panel.root.children, host]

  return result.promise
}
