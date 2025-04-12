import { Button } from "../views/button.js"
import { Label } from "../views/label.js"

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
