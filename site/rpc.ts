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

export function wRPC<
  In extends EventMap<In>, Out extends EventMap<Out>
>(out: Out, port: Worker | Window, handlers: In) {
  const promises = new Map<number, (data: any) => any>()
  let lastid = 0

  port.onmessage = (msg) => {
    const pkg = msg.data as Payload<In, any>
    if (pkg.type === 'req') {
      const { id, name } = pkg
      const data = handlers[name as keyof typeof handlers](...pkg.data)
      if (id !== -1) port.postMessage({ data, id, type: 'res' } as PayloadRes<any, any>)
    }
    else {
      const res = promises.get(pkg.id)
      promises.delete(pkg.id)
      res?.(pkg.data)
    }
  }

  return Object.fromEntries(Object.entries<() => any>(out).map(([name, fn]) => {
    const returns = fn()
    return [name, <K extends keyof Out>(...data: Parameters<Out[K]>): Promise<ReturnType<Out[K]>> => {
      let id = -1
      const p = Promise.withResolvers<ReturnType<Out[K]>>()
      if (returns) promises.set(id = lastid++, p.resolve)
      port.postMessage({ id, name, data, type: 'req' } as PayloadReq<Out, any>)
      return p.promise
    }]
  })) as { [K in keyof Out]: (...args: Parameters<Out[K]>) => Promise<ReturnType<Out[K]>> }
}
