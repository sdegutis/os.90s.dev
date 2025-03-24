import { $, Ref } from "./ref.js"

export class Dynamic {

  static make<T extends Dynamic>(this: new () => T, data: { [K in keyof T]?: T[K] | Ref<T[K]> }) {
    const o = new this()

    const init = data.init instanceof Ref ? data.init.val : data.init
    delete data.init

    Object.assign(o, data)

    for (const key in o) {
      let val = o[key]
      if (val instanceof Function) continue

      const ref = val instanceof Ref ? val : $(val);
      (o.$ as any)[key] = ref

      Object.defineProperty(o, key, {
        get: () => ref.val,
        set: (v) => ref.val = v,
        enumerable: true,
      })
    }

    const protos = []
    let proto: Dynamic | undefined = o

    while (proto = Object.getPrototypeOf(proto))
      if (Object.hasOwn(proto, 'init'))
        protos.push(proto)

    while (proto = protos.pop())
      proto.init!.call(o)

    init?.apply(o)

    return o
  }

  init?(): void

  $ = Object.create(null) as {
    readonly [K in (keyof this & string) as (K extends '$' ? never : K)]: this[K] extends ((...args: any) => any) | undefined ? never : Ref<this[K]>
  }

}
