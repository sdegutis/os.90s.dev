import { primitives } from "../views/index.js"
import type { View } from "../views/interface.js"

export type FunctionElement = (data: any) => JSX.Element

export function createNode(tag: any, { children, ...data }: any): JSX.Element {
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

      child.view.parent = view
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
