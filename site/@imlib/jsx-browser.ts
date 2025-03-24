import { make } from "../client/util/dyn.js"
import { Ref } from "../client/util/ref.js"
import { primitives } from "../client/views/index.js"
import { View } from "../client/views/view.js"

type Primitives = typeof primitives

type JsxAttrs<T> = {
  [K in keyof T]?: (

    K extends 'children'
    ? View | View[] | Ref<View[]>

    : T[K] extends ((...args: infer A) => infer R) | undefined
    ? (this: T, ...args: A) => R

    : T[K] | Ref<T[K]>

  )
}

declare global {

  namespace JSX {

    type DataFor<K extends keyof Primitives> = JsxAttrs<InstanceType<Primitives[K]>>

    type IntrinsicElements = {
      [K in keyof Primitives as K]: JsxAttrs<InstanceType<Primitives[K]>>
    }

    type ElementChildrenAttribute = { children: any }

    type Element = View

    type ElementType =
      | keyof IntrinsicElements
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
  return make(ctor, data)
}
