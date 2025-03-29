export type JsxAttrs<T> = {
  [K in keyof T]?: (

    K extends 'children' ? T[K] extends ArrayLike<any>
    ? T[K] | T[K][number] : T[K]

    : T[K] extends ((...args: infer A) => infer R) | undefined
    ? ((this: T, ...args: A) => R) | undefined

    : T[K]
  )
}

declare global {
  namespace JSX {
    type IntrinsicElements = { [key: string]: any }
    type ElementChildrenAttribute = { children: any }
    type Element = any
    type ElementType =
      | string
      | (new (config: JsxAttrs<any>) => any)
      | ((data: any) => JSX.Element)
  }
}

export const Fragment = ''
export const jsxs = createNode
export const jsx = createNode

function createNode(tag: any, data: Record<string, any>): JSX.Element {
  if (typeof tag === 'function') {
    if (canConstruct(tag)) {
      return new tag(data)
    }
    else {
      return tag(data)
    }
  }

  throw new Error('not ready for string tags yet')
}

function canConstruct(f: any) {
  try { Reflect.construct(Boolean, [], f) }
  catch (e) {
    console.log(e)
    return false

  }
  return true
}
