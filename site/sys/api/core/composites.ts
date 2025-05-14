export const composites: Record<string, Composite<any>> = Object.create(null)

export type Composite<T extends Record<string, any>> = (data: T) => JSX.Element
