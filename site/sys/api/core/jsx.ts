import { View } from "../views/view.js"
import { composites } from "./composites.js"
import { MaybeRef, Ref } from "./ref.js"

export type JsxAttrs<T> = {
  [K in keyof T as K extends `$${string}` ? never : K]?: (

    K extends 'children' ? T[K] extends ArrayLike<any>
    ? T[K] | T[K][number] | Ref<T[K]> : T[K]

    : T[K] extends ((...args: infer A) => infer R) | undefined
    ? ((this: T, ...args: A) => R) | undefined

    : `$${K & string}` extends keyof T ? T[`$${K & string}`] extends Ref<infer R>
    ? MaybeRef<R> | undefined : never

    : T[K]
  )
}

declare global {
  namespace JSX {
    type IntrinsicElements = { [key: string]: any }
    type ElementChildrenAttribute = { children: any }
    type Element = View
    type ElementType =
      | string
      | (new (data: JsxAttrs<any>) => JSX.Element)
      | ((data: any) => JSX.Element)
  }
}

export const Fragment = 'implicit'
export const jsxs = createNode
export const jsx = createNode

function createNode(tag: any, data: Record<string, any>): JSX.Element {
  if (typeof tag === 'string') return renderComposite(tag, data)
  if (canConstruct(tag)) return new tag(data)
  if (typeof tag === 'function') return tag(data)
  throw new Error(`Unsupported JSX tag: ${tag}`)
}

function renderComposite(tag: string, data: Record<string, any>) {
  const comp = composites[tag] ?? undefined
  if (!comp) throw new Error(`Composite "${tag}" not found`)
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
