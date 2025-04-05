
export const comps: Record<string, Component<any>> = Object.create(null)

export type Component<T extends Record<string, any>> = (data: T) => JSX.Element

export function getComponent(name: string): Component<any> | null {
  return comps[name] ?? null
}
