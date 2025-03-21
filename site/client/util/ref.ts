import { Listener } from "../../shared/listener.js"

export type Equals<T> = (a: T, b: T) => boolean

export class Ref<T> extends Listener<[T, T], void> {

  private _val: T
  equals?: Equals<T> | undefined

  constructor(val: T, equals?: Equals<T>) {
    super()
    this.equals = equals
    this._val = val
  }

  get val() { return this._val }
  set val(val: T) {
    if (this.equals?.(this._val, val) ?? this._val === val) return
    const old = this._val
    this.dispatch([this._val = val, old])
  }

  adapt<U>(fn: (data: T, old: T) => U) {
    const r = $(fn(this._val, this._val))
    this.watch(([data, old]) => r.val = fn(data, old))
    return r
  }

}

export const $ = <T>(val: T) => new Ref(val)
