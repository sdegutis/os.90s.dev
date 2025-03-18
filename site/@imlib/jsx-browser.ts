import { createNode, type FunctionElement, type FunctionNode, type IntrinsicNode } from "../client/util/jsx.js"
import type { Ref } from "../client/util/ref.js"
import { primitives } from "../client/views/index.js"

type Primitives = typeof primitives
type FixIntrinsicMethods<T, K extends keyof T, U> = T[K] extends (...args: infer A) => infer R ? (this: T, ...args: A) => R : U
type JsxAttrs<T> = { [K in keyof T]?: FixIntrinsicMethods<T, K, T[K] | Ref<T[K]>> }

let a: JsxAttrs<InstanceType<Primitives['border']>>



declare global {

  namespace JSX {

    type IntrinsicElements = { [K in keyof Primitives as K]: JsxAttrs<InstanceType<Primitives[K]>> }

    type ElementChildrenAttribute = { children: any }

    type Element = IntrinsicNode | FunctionNode

    type ElementType =
      | keyof IntrinsicElements
      | FunctionElement

  }
}

export const Fragment = ''
export const jsxs = createNode
export const jsx = createNode
