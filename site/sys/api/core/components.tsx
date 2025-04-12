import { Button } from "../views/button.js"
import { Label } from "../views/label.js"

export const comps: Record<string, Component<any>> = Object.create(null)

export type Component<T extends Record<string, any>> = (data: T) => JSX.Element

export function getComponent(name: string): Component<any> | null {
  return comps[name] ?? null
}

comps['button'] = (data: { action: () => void; text: string }) => {
  return <Button padding={2} onClick={data.action}>
    <Label text={data.text} />
  </Button>
}
