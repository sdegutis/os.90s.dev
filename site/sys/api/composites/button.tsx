import { Ref } from "../core/ref.js"
import { Button } from "../views/button.js"
import { Label } from "../views/label.js"

export function ButtonComp(data: {
  action: () => void
  style: 'submit' | 'cancel' | undefined
  children: any
}) {
  let children = data.children
  if (!(children instanceof Ref) && !(children instanceof Array)) {
    children = [children]
  }
  if (children instanceof Array) {
    children = children.map(child => typeof child === 'string'
      ? <Label text={child} />
      : child
    )
  }

  const background = data.style === 'submit' ? 0xffffff33 :
    data.style === 'cancel' ? 0x99000099 :
      undefined

  return <Button background={background} padding={2} onClick={data.action}>
    {children}
  </Button>
}
