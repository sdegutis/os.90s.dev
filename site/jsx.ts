import { controls } from './controls.js'
import { View } from './controls/view.js'
import { Listener, Ref } from './events.js'

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

class IntrinsicNode {

  ctor: typeof View
  data: Record<string, any>
  children: (IntrinsicNode | FunctionNode)[]
  view: View

  private destroying = new Listener()

  constructor(ctor: typeof View, data: Record<string, any>, children: any[]) {
    this.ctor = ctor
    this.data = data
    this.children = children
    this.view = this.createView()

    for (const [key, val] of Object.entries(data)) {
      if (val instanceof Ref) {
        const unwatch = val.watch(v => {
          this.view[key as keyof View] = v
          this.view.changed(key, v)
        })
        this.destroying.watch(unwatch)
      }
    }
  }

  detach() {
    this.destroying.dispatch()
    this.destroying.clear()
  }

  private realizeData() {
    return Object.fromEntries(Object.entries(this.data).map(([k, v]) => {
      return [k, v instanceof Ref ? v.val : v]
    }))
  }

  private createView(): View {
    const view = new this.ctor(this.realizeData())
    view.children = this.children.map(c => {
      const child = c.view
      child.parent = view
      return child
    })
    return view
  }

}

class FunctionNode {

  fn: (data: Record<string, any>) => JSX.Element
  data: Record<string, any>
  children: (IntrinsicNode | FunctionNode)[]
  view: View

  constructor(fn: (data: any) => JSX.Element, data: Record<string, any>, children: any[]) {
    this.fn = fn
    this.data = data
    this.children = children
    this.view = this.createView()
  }

  private createView(): View {
    const retval = this.fn({ ...this.data, children: this.children.map(c => c.view) })
    const node = $$(retval)
    return node.view
  }

}
