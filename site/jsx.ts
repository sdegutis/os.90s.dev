import { controls } from './controls.js'
import { View } from './controls/view.js'
import type { Ref } from './events.js'

type Controls = typeof controls
type JsxChildren = (JSX.Element | JSX.Element[] | Ref<JSX.Element> | Ref<JSX.Element[]>)
type FixIntrinsicMethods<T, K extends keyof T, U> = T[K] extends (...args: infer A) => infer R ? (this: T, ...args: A) => R : U
type FixIntrinsicChildren<K, U> = K extends 'children' ? JsxChildren : U
type JsxAttrs<T> = { [K in keyof T]?: FixIntrinsicChildren<K, FixIntrinsicMethods<T, K, T[K] | Ref<T[K]>>> }

declare global {

  namespace JSX {

    type IntrinsicElements = { [K in keyof Controls as K]: JsxAttrs<InstanceType<Controls[K]>> }
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
}

export function $$({ [Symbol.for('jsx')]: tag, children, ...jsx }: JSX.Element): FunctionNode | IntrinsicNode {
  children = (
    children === undefined ? [] :
      children instanceof Array ? children :
        [children]
  ).map($$)

  if (typeof tag === 'function') {
    return new FunctionNode(tag, jsx, children)
  }
  else {
    const ctor = controls[tag.toLowerCase() as keyof typeof controls]
    return new IntrinsicNode(ctor, jsx, children)
  }
}

type IntrinsicData<T = any> = { [K in keyof T]: T[K] | Ref<T[K]> }

class IntrinsicNode {

  ctor: typeof View
  data: IntrinsicData
  children: (IntrinsicNode | FunctionNode)[]
  view: View

  constructor(ctor: typeof View, data: IntrinsicData, children: any[]) {
    this.ctor = ctor
    this.data = data
    this.children = children
    this.view = this.render()
  }

  private render(): View {
    const view = new this.ctor(this.data)
    view.children = this.children.map(c => c.view)
    return view
  }

}

class FunctionNode {

  fn: (data: any) => JSX.Element
  data: any
  children: (IntrinsicNode | FunctionNode)[]
  view: View

  constructor(fn: (data: any) => JSX.Element, data: any, children: any[]) {
    this.fn = fn
    this.data = data
    this.children = children
    this.view = this.render()
  }

  private render(): View {
    const retval = this.fn({ ...this.data, children: this.children.map(c => c.view) })
    const node = $$(retval)
    return node.view
  }

}
