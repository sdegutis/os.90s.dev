import { Ref } from "../core/ref.js"
import { Label } from "../views/label.js"
import { View } from "../views/view.js"

class Flow extends View {

  override adjust(): void {
    const w = this.parent?.size.w
    console.log('in here', w)
  }

}

export function ImplicitComp(data: { children: any }) {
  let children = data.children

  if (!(children instanceof Ref)) {
    if (!(children instanceof Array)) children = [children]
    const normalized: View[] = []

    for (const child of children) {
      if (typeof child === 'string') {
        for (const line of child.split('\n')) {
          for (const word of line.split(/[\t \r]/)) {
            normalized.push(<Label text={word} />)
          }
        }
      }
      else {
        normalized.push(child)
      }
    }

    children = normalized
  }

  return <Flow children={children} />
}
