import { Border } from "../views/border.js"
import { Scroll } from "../views/scroll.js"
import { TextBox } from "../views/textbox.js"

export function TextFieldComp(data: { length?: number } & ConstructorParameters<typeof TextBox>[0]) {
  const length = data.length ?? 50
  const textbox = <TextBox {...data} /> as TextBox
  const border = <Border padding={2} children={[textbox]} /> as Border
  return <Scroll
    showh={false}
    showv={false}
    background={0x00000033}
    onMouseDown={function (...args) { textbox.onMouseDown(...args) }}
    onMouseMove={function (...args) { textbox.onMouseMove?.(...args) }}
    onMouseUp={function (...args) { textbox.onMouseUp?.(...args) }}
    size={border.$size.adapt(s => ({ w: length, h: border.$size.$.h }))}
    children={[border]}
  />
}
