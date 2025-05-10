import { Listener, ListenerDone } from "./listener.js"

export type Equals<T> = (a: T, b: T) => boolean

/**
 * A pointer with events
 */
export class Ref<T> {

  private defers: Ref<T> | undefined
  private interceptors = new Set<(a: T) => T>()
  private listener = new Listener<[T, T], void>()
  private val: T
  equals?: Equals<T> | undefined

  /** It's easier to use `$` */
  constructor(val: T, equals?: Equals<T>) {
    this.equals = equals
    this.val = val
  }

  get $() {
    if (this.defers) return this.defers.$
    return this.val
  }

  /**
   * Sets or gets the current value.
   * 
   * Setting also notifies watchers/adapters/etc.
   */
  set $(val: T) {
    if (this.defers) {
      this.defers.$ = val
      return
    }

    this.interceptors.forEach(fn => val = fn(val))
    if (this.equals?.(this.val, val) ?? this.val === val) return
    const old = this.val
    this.val = val
    this.listener.dispatch([val, old])
  }

  update(fn: (data: T) => Partial<T>) {
    this.$ = { ...this.$, ...fn(this.$) }
  }

  watch(fn: (data: T, old: T) => void): ListenerDone {
    if (this.defers) return this.defers.watch(fn)

    return this.listener.watch(([data, old]) => fn(data, old))
  }

  intercept(fn: (data: T) => T, deps: Ref<any>[] = []): ListenerDone {
    if (this.defers) return this.defers.intercept(fn)

    this.interceptors.add(fn)
    this.$ = fn(this.$)
    multiplex(deps, () => {
      this.$ = fn(this.$)
    })
    return () => this.interceptors.delete(fn)
  }

  adapt<U>(fn: (data: T, old: T) => U, equals?: Equals<U>): Ref<U> {
    if (this.defers) return this.defers.adapt(fn, equals)

    const r = $(fn(this.val, this.val), equals)
    this.watch((data, old) => r.$ = fn(data, old))
    return r
  }

  async adaptAsync<U>(fn: (data: T, old: T) => Promise<U>, equals?: Equals<U>): Promise<Ref<U>> {
    if (this.defers) return this.defers.adaptAsync(fn, equals)

    const init: U = await fn(this.val, this.val)
    const r = $(init, equals)
    this.watch(async (data, old) => r.$ = await fn(data, old))
    return r
  }

  defer(other: Ref<T>) {
    while (other.defers) other = other.defers

    this.$ = other.$
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
  const ref = $(fn(...refs.map(r => r.$) as A))
  for (const r of refs) {
    r.watch(() => ref.$ = fn(...refs.map(r => r.$) as A))
  }
  return ref
}

export function makeRef<T, K extends keyof T>(o: T, k: K) {
  const ref = $(o[k])
  Object.defineProperty(o, k, {
    enumerable: true,
    configurable: false,
    get: () => ref.$,
    set: (v) => ref.$ = v,
  })
  return ref
}

export type MaybeRef<T> = T | Ref<T>

export function defRef<T>(t: MaybeRef<T>): Ref<T> {
  return t instanceof Ref ? t : $(t)
}
