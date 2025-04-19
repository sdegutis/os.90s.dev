import { Listener, ListenerDone } from "./listener.js"

export type Equals<T> = (a: T, b: T) => boolean

export class Ref<T> {

  private defers: Ref<T> | undefined
  private interceptors = new Set<(a: T) => T>()
  private listener = new Listener<[T, T], void>()
  private _val: T
  equals?: Equals<T> | undefined

  constructor(val: T, equals?: Equals<T>) {
    this.equals = equals
    this._val = val
  }

  get val() {
    if (this.defers) return this.defers.val
    return this._val
  }

  set val(val: T) {
    if (this.defers) {
      this.defers.val = val
      return
    }

    this.interceptors.forEach(fn => val = fn(val))
    if (this.equals?.(this._val, val) ?? this._val === val) return
    const old = this._val
    this._val = val
    this.listener.dispatch([val, old])
  }

  watch(fn: (data: T, old: T) => void): ListenerDone {
    if (this.defers) return this.defers.watch(fn)

    return this.listener.watch(([data, old]) => fn(data, old))
  }

  intercept(fn: (data: T) => T, deps: Ref<any>[] = []): ListenerDone {
    if (this.defers) return this.defers.intercept(fn)

    this.interceptors.add(fn)
    this.val = fn(this.val)
    multiplex(deps, () => {
      this.val = fn(this.val)
    })
    return () => this.interceptors.delete(fn)
  }

  adapt<U>(fn: (data: T, old: T) => U, equals?: Equals<U>): Ref<U> {
    if (this.defers) return this.defers.adapt(fn, equals)

    const r = $(fn(this._val, this._val), equals)
    this.watch((data, old) => r.val = fn(data, old))
    return r
  }

  async adaptAsync<U>(fn: (data: T, old: T) => Promise<U>, equals?: Equals<U>): Promise<Ref<U>> {
    if (this.defers) return this.defers.adaptAsync(fn, equals)

    const init: U = await fn(this._val, this._val)
    const r = $(init, equals)
    this.watch(async (data, old) => r.val = await fn(data, old))
    return r
  }

  defer(other: Ref<T>) {
    while (other.defers) other = other.defers

    this.val = other.val
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
    r.watch(() => ref.val = fn(...refs.map(r => r.val) as A))
  }
  return ref
}

export function makeRef<T, K extends keyof T>(o: T, k: K) {
  const val = o[k]
  const ref = $(val)
  Object.defineProperty(o, k, {
    enumerable: true,
    configurable: false,
    get: () => ref.val,
    set: (v) => ref.val = v,
  })
  return ref
}

export type MaybeRef<T> = T | Ref<T>

export function defRef<T>(t: MaybeRef<T>): Ref<T> {
  if (t instanceof Ref) return t
  return $(t)
}
