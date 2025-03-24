import { $, Ref } from "./ref.js"

export class Dynamic {

  init?(): void

  $ = Object.create(null) as {
    readonly [K in (keyof this & string) as (K extends '$' ? never : K)]: this[K] extends ((...args: any) => any) | undefined ? never : Ref<this[K]>
  }

  $setup() {
    for (const key in this) {
      let val = this[key]
      if (val instanceof Function) continue

      const ref = val instanceof Ref ? val : $(val);
      (this.$ as any)[key] = ref

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

}

export function make<T extends Dynamic>(
  ctor: new () => T,
  data: { [K in keyof T]?: T[K] | Ref<T[K]> },
): T {
  const v = new ctor()
  const init = data.init
  delete data.init
  Object.assign(v, data)
  v.$setup()
  const initfn = (init instanceof Ref ? init.val : init)
  initfn?.apply(v)
  return v
}
