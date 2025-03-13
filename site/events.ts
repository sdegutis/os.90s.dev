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

  private _data: T

  constructor(data: T) {
    super()
    this._data = data
  }

  get data() { return this._data }
  set data(val: T) { this.dispatch(this._data = val) }

}

export const $ = <T>(data: T) => new Ref(data)
