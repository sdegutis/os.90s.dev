import { View } from './controls/view.js'

declare global {

  type Controls = typeof import('./controls.ts').controls
  type Ref<T> = import('./events.js').Ref<T>

  type JsxChildren = (JSX.Element | JSX.Element[] | Ref<JSX.Element> | Ref<JSX.Element[]>)
  type JsxAttrs<T> = { [K in keyof T]?: K extends 'children' ? JsxChildren : T[K] | Ref<T[K]> }

  namespace JSX {

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
}

export function $$({ [Symbol.for('jsx')]: tag, children, ...jsx }: JSX.Element): FunctionNode | IntrinsicNode {
  children = (
    children === undefined ? [] :
      children instanceof Array ? children :
        [children]
  ).map($$)

  if (typeof tag === 'function') {
    return new FunctionNode(tag, jsx, children.map($$))
  }
  else {
    return new IntrinsicNode(tag, jsx, children.map($$))
  }
}

class IntrinsicNode {

  tag: string
  data: any
  children: (IntrinsicNode | FunctionNode)[]
  view: View

  constructor(tag: string, data: any, children: any[]) {
    this.tag = tag
    this.data = data
    this.children = children
    this.view = this.render()
  }

  private render(): View {
    const res = { tag: this.tag, data: this.data, children: this.children.map(c => c.view) }
    const view = new View()
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
    // return new View()
    const retval = this.fn({ ...this.data, children: this.children.map(c => c.view) })
    const node = $$(retval)
    return node.view
  }

}
