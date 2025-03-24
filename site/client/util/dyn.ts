import { Listener } from "../../shared/listener.js"
import { $, Ref } from "./ref.js"

export class Dynamic {

  init?(): void

  $$setup() {
    for (const key in this) {
      let val = this[key]
      if (val instanceof Function) continue

      const ref = val instanceof Ref ? val : $(val)
      Object.defineProperty(this, `$${key}`, {
        value: ref,
        enumerable: false,
      })

      Object.defineProperty(this, key, {
        get: () => ref.val,
        set: (v) => ref.val = v,
        enumerable: true,
      })
    }

    const protos = []
    let proto: Dynamic | undefined = this

    while (proto = Object.getPrototypeOf(proto))
      if (Object.hasOwn(proto, 'init'))
        protos.push(proto)

    while (proto = protos.pop())
      proto.init!.call(this)
  }

  $$watch<K extends keyof this>(key: K, fn: (val: this[K], old: this[K]) => void) {
    return this.$$ref(key).watch((val, old) => fn(val, old))
  }

  $$ref<K extends keyof this>(key: K) {
    return this[`$${key as string}` as keyof this] as Ref<this[K]>
  }

  $$multiplex(...keys: (keyof this)[]) {
    const listener = new Listener()
    keys.forEach(key => this.$$watch(key, () => listener.dispatch()))
    return listener
  }

}

export function make<T extends Dynamic>(
  ctor: new () => T,
  data: { [K in keyof T]?: T[K] | Ref<T[K]> },
): T {
  const v = new ctor()
  const init = data.init
  delete data.init
  Object.assign(v, data)
  v.$$setup()
  const initfn = (init instanceof Ref ? init.val : init)
  initfn?.apply(v)
  return v
}
