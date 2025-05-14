import { composites } from "../core/composites.js"
import { Label } from "../views/label.js"

composites['implicit'] = ImplicitComp

function ImplicitComp(data: { children: string | string[] }) {
  const str = typeof data.children === 'string'
    ? data.children
    : data.children.join('')
  return <Label text={str} />
}
