import { Ref } from "../core/ref.js"
import { Grid } from "../views/grid.js"
import { Label } from "../views/label.js"
import { View } from "../views/view.js"

export function ImplicitComp(data: { children: any }) {
  let children = data.children

  if (!(children instanceof Ref)) {
    if (!(children instanceof Array)) children = [children]
    const normalized: View[] = []

    for (const child of children) {
      if (typeof child === 'string') {
        normalized.push(<Label text={child} />)
      }
      else {
        normalized.push(child)
      }
    }

    children = normalized
  }

  return <Grid flow xgap={3} ygap={1} children={children} />
}
