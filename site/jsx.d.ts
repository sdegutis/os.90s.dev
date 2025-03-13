type Controls = typeof import('./controls.ts').controls
type Ref<T> = import('./events.js').Ref<T>

type JsxChildren = (JSX.Element | JSX.Element[] | Ref<JSX.Element> | Ref<JSX.Element[]>)
type JsxAttrs<T> = { [K in keyof T]?: K extends 'children' ? JsxChildren : T[K] | Ref<T[K]> }

declare namespace JSX {

  type IntrinsicElements = { [K in keyof Controls as Lowercase<K>]: JsxAttrs<InstanceType<Controls[K]>> }
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
