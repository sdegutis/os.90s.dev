import { Ref } from "../client/util/ref.js"
import { primitives } from "../client/views/index.js"
import { make, type view } from "../client/views/view.js"

type Primitives = typeof primitives

type FixThis<T, K extends keyof T, Else> =
  T[K] extends (...args: infer A) => infer R
  ? (this: T, ...args: A) => R
  : Else

type JsxChildren = view | view[] | Ref<view[]>

type JsxAttrs<T> = {
  [K in keyof T]?: K extends 'children' ? JsxChildren : FixThis<T, K, T[K] | Ref<T[K]>>
}

type FunctionElement = (data: any) => JSX.Element

declare global {

  namespace JSX {

    type IntrinsicElements = {
      [K in keyof Primitives as K]: JsxAttrs<InstanceType<Primitives[K]>>
    }

    type ElementChildrenAttribute = { children: any }

    type Element = view

    type ElementType =
      | keyof IntrinsicElements
      | FunctionElement

  }

}

export const Fragment = ''
export const jsxs = createNode
export const jsx = createNode

function createNode(tag: any, data: any): JSX.Element {
  if (typeof tag === 'function') {
    return tag(data)
  }

  const ctor = primitives[tag as keyof typeof primitives]
  return make(ctor, data)
}
