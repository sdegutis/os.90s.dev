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

  adapt<U>(fn: (data: T, old: T) => U): Ref<U> {
    if (this.defers) return this.defers.adapt(fn)

    const r = $(fn(this._val, this._val))
    this.watch((data, old) => r.val = fn(data, old))
    return r
  }

  async adaptAsync<U>(fn: (data: T, old: T) => Promise<U>): Promise<Ref<U>> {
    if (this.defers) return this.defers.adaptAsync(fn)

    const init: U = await fn(this._val, this._val)
    const r = $(init)
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

export const $ = <T>(val: T) => new Ref(val)

export function multiplex<T>(refs: Ref<any>[], fn: () => T) {
  const ref = $(fn())
  for (const r of refs) {
    r.watch(() => ref.val = fn())
  }
  return ref
}

export function makeRef<T, K extends keyof T>(o: T, k: K) {
  const rk = `$${k as string}` as keyof T
  const val = o[k]
  Object.defineProperty(o, k, {
    enumerable: true,
    configurable: false,
    get: () => (o[rk] as Ref<any>).val,
    set: (v) => (o[rk] as Ref<any>).val = v,
  })
  return $(val)
}

export type MaybeRef<T> = T | Ref<T>

export function defRef<T>(t: MaybeRef<T>): Ref<T> {
  if (t instanceof Ref) return t
  return $(t)
}
