import { getComponent } from "./components.js"
import { MaybeRef, Ref } from "./core/ref.js"

export type JsxAttrs<T> = {
  [K in keyof T as K extends `$${string}` ? never : K]?: (

    K extends 'children' ? T[K] extends ArrayLike<any>
    ? T[K] | T[K][number] | Ref<T[K]> : T[K]

    : T[K] extends ((...args: infer A) => infer R) | undefined
    ? ((this: T, ...args: A) => R) | undefined

    : `$${K & string}` extends keyof T ? T[`$${K & string}`] extends Ref<infer R>
    ? MaybeRef<R> : never

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
      | (new (data: JsxAttrs<any>) => JSX.Element)
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

  const comp = getComponent(tag)
  if (!comp) throw new Error(`Component "${tag}" not found`)

  return comp(data)
}

function canConstruct(f: any) {
  try { Reflect.construct(Boolean, [], f) }
  catch (e) {
    console.log(e)
    return false

  }
  return true
}
