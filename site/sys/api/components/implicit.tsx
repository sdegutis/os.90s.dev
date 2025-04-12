import { Label } from "../views/label.js"

export function implicit(data: { children: string | string[] }) {
  const str = typeof data.children === 'string'
    ? data.children
    : data.children.join('')
  return <Label text={str} />
}
