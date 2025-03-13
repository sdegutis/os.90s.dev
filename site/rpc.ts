export const Sys = {
  newpanel(w: number, h: number): number { return 1 },
  adjust(x: number, y: number, w: number, h: number): void { },
  blit(pixels: Uint8ClampedArray): void { },
}

export const Prog = {
  mouseMoved(x: number, y: number): void { },
  open(filepath: string): boolean { return true },
  focus(): void { },
  blur(): void { },
}



type PayloadReq<T extends EventMap<T>, K extends keyof T> = {
  type: 'req'
  id: number
  name: K
  data: Parameters<T[K]>
}

type PayloadRes<T extends EventMap<T>, K extends keyof T> = {
  type: 'res'
  id: number
  data: ReturnType<T[K]>
}

type Payload<T extends EventMap<T>, K extends keyof T> =
  | PayloadReq<T, K>
  | PayloadRes<T, K>

type EventMap<T> = { [K in keyof T]: (...args: any) => any }

export class wRPC<In extends EventMap<In>, Out extends EventMap<Out>> {

  private port: Worker | Window
  private promises = new Map<number, (data: any) => any>()
  private lastid = 0

  inn: In
  out: Out

  constructor(inn: In, out: Out, port: Worker | Window, handlers: In) {
    this.inn = inn
    this.out = out
    this.port = port
    this.port.onmessage = (msg) => {
      const pkg = msg.data as Payload<In, any>
      if (pkg.type === 'req') {
        const { id, name } = pkg
        const data = handlers[name as keyof typeof handlers](...pkg.data)
        if (id !== -1) this.port.postMessage({ data, id, type: 'res' } as PayloadRes<any, any>)
      }
      else {
        const res = this.promises.get(pkg.id)
        this.promises.delete(pkg.id)
        res?.(pkg.data)
      }
    }
  }

  send<K extends keyof Out>(name: K, ...data: Parameters<Out[K]>): Promise<ReturnType<Out[K]>> {
    const returns = this.out[name]()
    let id = -1
    const p = Promise.withResolvers<ReturnType<Out[K]>>()
    if (returns) this.promises.set(id = this.lastid++, p.resolve)
    this.port.postMessage({ id, name, data, type: 'req' } as PayloadReq<Out, K>)
    return p.promise
  }

}
