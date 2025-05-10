import { Listener, ListenerDone } from "./listener.js"

export type Equals<T> = (a: T, b: T) => boolean

/**
 * A pointer with events
 */
export class Ref<T> {

  private defers: Ref<T> | undefined
  private interceptors = new Set<(a: T) => T>()
  private listener = new Listener<[T, T], void>()

  /** The current value */
  readonly val: T

  /** Used instead of === if set */
  equals?: Equals<T> | undefined

  /** It's easier to use `$(...)` */
  constructor(val: T, equals?: Equals<T>) {
    this.equals = equals
    this.val = val
  }

  /** Notifies watchers/etc. */
  set(val: T) {
    if (this.defers) {
      this.defers.set(val)
      return
    }

    this.interceptors.forEach(fn => val = fn(val))
    if (this.equals?.(this.val, val) ?? this.val === val) return
    const old = this.val
    { (this as { val: T }).val = val }
    this.listener.dispatch([val, old])
  }

  merge(fn: T extends Record<any, any> ? (data: T) => Partial<T> : never) {
    this.set({ ...this.val, ...fn(this.val) })
  }

  push<A extends T extends Array<infer I> ? I[] : never>(item: A[number]) {
    if (!(this.val instanceof Array)) return
    this.set([...this.val, item] as T)
  }

  watch(fn: (data: T, old: T) => void): ListenerDone {
    if (this.defers) return this.defers.watch(fn)

    return this.listener.watch(([data, old]) => fn(data, old))
  }

  intercept(fn: (data: T) => T, deps: Ref<any>[] = []): ListenerDone {
    if (this.defers) return this.defers.intercept(fn)

    this.interceptors.add(fn)
    this.set(fn(this.val))
    multiplex(deps, () => {
      this.set(fn(this.val))
    })
    return () => this.interceptors.delete(fn)
  }

  adapt<U>(fn: (data: T, old: T) => U, equals?: Equals<U>): Ref<U> {
    if (this.defers) return this.defers.adapt(fn, equals)

    const r = $(fn(this.val, this.val), equals)
    this.watch((data, old) => r.set(fn(data, old)))
    return r
  }

  async adaptAsync<U>(fn: (data: T, old: T) => Promise<U>, equals?: Equals<U>): Promise<Ref<U>> {
    if (this.defers) return this.defers.adaptAsync(fn, equals)

    const init: U = await fn(this.val, this.val)
    const r = $(init, equals)
    this.watch(async (data, old) => r.set(await fn(data, old)))
    return r
  }

  defer(other: Ref<T>) {
    while (other.defers) other = other.defers

    other.watch(val => (this as { val: T }).val = val)

    this.set(other.val)
    this.defers = other

    this.listener.list.forEach(fn => other.listener.list.add(fn))
    this.interceptors.forEach(fn => other.interceptors.add(fn))

    this.listener.clear()
    this.interceptors.clear()
  }

}

export const $ = <T>(val: T, equals?: Equals<T>) => new Ref(val, equals)

export function multiplex<
  T,
  const R extends Ref<any>[],
  A extends { [N in keyof R]: R[N] extends Ref<infer V> ? V : never }
>(refs: R, fn: (...args: A) => T) {
  const ref = $(fn(...refs.map(r => r.val) as A))
  for (const r of refs) {
    r.watch(() => ref.set(fn(...refs.map(r => r.val) as A)))
  }
  return ref
}

export function makeRef<T, K extends keyof T>(o: T, k: K) {
  const ref = $(o[k])
  Object.defineProperty(o, k, {
    enumerable: true,
    configurable: false,
    get: () => ref.val,
    set: (v) => ref.set(v),
  })
  return ref
}

export type MaybeRef<T> = T | Ref<T>

export function defRef<T>(t: MaybeRef<T>): Ref<T> {
  return t instanceof Ref ? t : $(t)
}
