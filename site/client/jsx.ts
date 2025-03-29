import { View } from "./views/view.js"

declare global {

  namespace JSX {

    type IntrinsicElements = {
      [key: string]: any,
    }

    type ElementChildrenAttribute = { children: any }

    type Element = View

    type ElementType =
      | string
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
