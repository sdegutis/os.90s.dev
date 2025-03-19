import { Listener } from "../../shared/listener.js"

export class Ref<T> extends Listener<T, void> {

  private _val: T

  constructor(val: T) {
    super()
    this._val = val
  }

  get val() { return this._val }
  set val(val: T) {
    if (this._val === val) return
    this.dispatch(this._val = val)
  }

  adapt<U>(fn: (data: T) => U) {
    const r = $(fn(this._val))
    this.watch(d => r.val = fn(d))
    return r
  }

}

export const $ = <T>(val: T) => new Ref(val)
