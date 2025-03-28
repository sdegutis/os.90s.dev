import { Ref } from "./core/ref.js"
import { primitives } from "./views/index.js"
import { View } from "./views/view.js"

type Primitives = typeof primitives

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

    // type IntrinsicElements = {
    //   [K in keyof Primitives as K]: JsxAttrs<InstanceType<Primitives[K]>>
    // }

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
  if (typeof tag === 'function') {
    return tag(data)
  }

  if (data["children"] instanceof View) {
    data["children"] = [data["children"]]
  }

  const ctor = primitives[tag as keyof typeof primitives]
  return ctor.make(data)
}
