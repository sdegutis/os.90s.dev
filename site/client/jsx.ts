import { Ref } from "./core/ref.js"
import { View } from "./views/view.js"

export type JsxAttrs<T> = {
  [K in keyof T]?: (

    K extends 'children'
    ? View | View[] | Ref<View[]>

    : T[K] extends ((...args: infer A) => infer R) | undefined
    ? ((this: T, ...args: A) => R) | undefined

    : T[K] | Ref<T[K]>

  )
}

declare global {

  namespace JSX {

    type IntrinsicElements = {
      [key: string]: any,
    }

    type ElementChildrenAttribute = { children: any }

    type Element = View

    type ElementType =
      | (new (config?: any) => any)
      | ((data: any) => JSX.Element)

  }

}

export const Fragment = ''
export const jsxs = createNode
export const jsx = createNode

function createNode(tag: any, data: Record<string, any>): JSX.Element {
  if (tag === View || tag.prototype instanceof View) {
    if (data["children"] instanceof View) {
      data["children"] = [data["children"]]
    }
    return tag.make(data)
  }

  if (typeof tag === 'function') {
    return tag(data)
  }

  throw new Error('not ready for string tags yet')
}
