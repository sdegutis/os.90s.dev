type C = typeof import('./controls.ts').controls
type Ref<T> = import('./events.js').Ref<T>

type RefOrVal<T> = { [K in keyof T]?: T[K] | Ref<T[K]> }

declare namespace JSX {

  type IntrinsicElements = { [K in keyof C as Lowercase<K>]: RefOrVal<InstanceType<C[K]>> }
  type ElementChildrenAttribute = { children: any }

  type ElementType =
    | keyof IntrinsicElements
    | ((data: any) => Element)

  type Element = {
    [jsx: symbol]: any,
    [attr: string]: any,
    children?: any,
  }

}
