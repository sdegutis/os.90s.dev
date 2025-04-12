import { Border } from "../views/border.js"
import { Button } from "../views/button.js"
import { Label } from "../views/label.js"
import { Scroll } from "../views/scroll.js"
import { TextBox } from "../views/textbox.js"
import { JsxAttrs } from "./jsx.js"

export const components: Record<string, Component<any>> = Object.create(null)
export type Component<T extends Record<string, any>> = (data: T) => JSX.Element

components['button'] = (data: { action: () => void; text: string }) => {
  return <Button padding={2} onClick={data.action}>
    <Label text={data.text} />
  </Button>
}

components['implicit'] = (data: { children: string | string[] }) => {
  const str = typeof data.children === 'string'
    ? data.children
    : data.children.join('')
  return <Label text={str} />
}

components['textfield'] = (data: { length?: number } & JsxAttrs<TextBox>) => {
  const length = data.length ?? 50
  const textbox = <TextBox {...data} /> as TextBox
  const border = <Border
    padding={2}
    children={[textbox]}
  /> as Border
  return <Scroll
    showh={false}
    showv={false}
    background={0x00000033}
    onMouseDown={function (...args) { textbox.onMouseDown(...args) }}
    onMouseMove={function (...args) { textbox.onMouseMove?.(...args) }}
    onMouseUp={function (...args) { textbox.onMouseUp?.(...args) }}
    size={border.$size.adapt(s => ({ w: length, h: border.$size.val.h }))}
    children={[border]}
  />
}
