import { Ref } from '../client/util/ref.js'
import { primitives } from '../client/views/index.js'
import type { View } from '../client/views/interface.js'

type FixIntrinsicMethods<T, K extends keyof T, U> = T[K] extends (...args: infer A) => infer R ? (this: T, ...args: A) => R : U
type JsxAttrs<T> = { [K in keyof T]?: FixIntrinsicMethods<T, K, T[K] | Ref<T[K]>> }
type Primitives = typeof primitives
type GivenData<T extends keyof Primitives> = JsxAttrs<ReturnType<Primitives[T]>>
type FunctionElement = (data: any) => JSX.Element

declare global {

  namespace JSX {

    type IntrinsicElements = { [K in keyof Primitives as K]: GivenData<K> }

    type ElementChildrenAttribute = { children: any }

    type Element = IntrinsicNode | FunctionNode

    type ElementType =
      | keyof IntrinsicElements
      | FunctionElement

  }
}

export const Fragment = ''
export const jsxs = jsx
export function jsx(tag: any, { children, ...data }: any): JSX.Element {
  if (typeof tag === 'function') {
    return new FunctionNode(data, children, tag)
  }
  else {
    const base = primitives[tag as keyof typeof primitives]
    return new IntrinsicNode({ ...base(), ...data }, children)
  }
}


export class IntrinsicNode {

  data: Record<string, any>
  children: JSX.Element[]
  view!: View

  constructor(data: Record<string, any>, children: JSX.Element[] | JSX.Element | undefined) {
    this.data = data
    this.children = children === undefined ? [] : children instanceof Array ? children : [children]
  }

  render() {
    const view = this.data as View
    const children: View[] = []

    for (const child of this.children) {
      child.render()
      children.push(child.view)
    }

    view.children = children

    this.view = view
  }

}

export class FunctionNode {

  fn: FunctionElement
  data: Record<string, any>
  children: any
  view!: View

  constructor(data: Record<string, any>, children: any, fn: FunctionElement) {
    this.fn = fn
    this.data = data
    this.children = children
  }

  render() {
    const got = this.fn({ children: this.children, ...this.data })
    got.render()
    this.view = got.view
  }

}
