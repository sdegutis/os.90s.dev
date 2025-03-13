type C = typeof import('./controls.ts').controls
type Reactive<T> = import('./events.js').Ref<T>

type Partial2<T> = { [K in keyof T]?: T[K] | Reactive<T[K]> }

declare namespace JSX {

  type IntrinsicElements = { [K in keyof C as Lowercase<K>]: Partial2<InstanceType<C[K]>> }
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
