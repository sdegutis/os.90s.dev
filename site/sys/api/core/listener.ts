export type ListenerDone = () => void

export class Listener<T = void, U = void> {

  list = new Set<(data: T) => U>()

  dispatch(data: T) {
    for (const fn of this.list) {
      fn(data)
    }
  }

  watch(fn: (data: T) => U): ListenerDone {
    this.list.add(fn)
    return () => { this.list.delete(fn) }
  }

  clear() {
    this.list.clear()
  }

}
