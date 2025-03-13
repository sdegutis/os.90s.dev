import { Listener } from "./listener.js"

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

}

export const $ = <T>(val: T) => new Ref(val)
