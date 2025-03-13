export class Listener<T = void, U = void> {

  private list = new Set<(data: T) => U>()

  dispatch(data: T) {
    for (const fn of this.list) {
      fn(data)
    }
  }

  watch(fn: (data: T) => U) {
    this.list.add(fn)
    return () => { this.list.delete(fn) }
  }

  destroy() {
    this.clear()
  }

  clear() {
    this.list.clear()
  }

}

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
