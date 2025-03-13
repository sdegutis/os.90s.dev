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

type PayloadReq<T extends EventMap<T>, K extends keyof T> = { type: 'req', id: number, data: Parameters<T[K]>, name: K }
type PayloadRes<T extends EventMap<T>, K extends keyof T> = { type: 'res', id: number, data: ReturnType<T[K]> }
type Payload<T extends EventMap<T>, K extends keyof T> = | PayloadReq<T, K> | PayloadRes<T, K>
type EventMap<T> = { [K in keyof T]: (...args: any) => any }

export function wRPC<In extends EventMap<In>, Out extends EventMap<Out>>(out: Out, port: Worker | Window, handlers: In) {
  const promises = new Map<number, (data: any) => any>()
  let lastid = 0

  port.onmessage = (msg) => {
    const pkg = msg.data as Payload<In, any>
    if (pkg.type === 'req') {
      const { id, name } = pkg
      const data = handlers[name as keyof typeof handlers](...pkg.data)
      if (id !== -1) {
        const payload: PayloadRes<any, any> = { data, id, type: 'res' }
        port.postMessage(payload)
      }
    }
    else {
      const res = promises.get(pkg.id)
      promises.delete(pkg.id)
      res?.(pkg.data)
    }
  }

  type ProxiedOutFn = {
    [K in keyof Out]: (...args: [...Parameters<Out[K]>, tr?: Transferable[]]) => Promise<ReturnType<Out[K]>>
  }

  return Object.fromEntries(Object.entries<() => any>(out).map(([name, fn]) => {
    const returns = fn()
    return [name, <K extends keyof Out>(...data: [...Parameters<Out[K]>, tr?: Transferable[]]): Promise<ReturnType<Out[K]>> => {
      const transfer = ((data.length === fn.length + 1) ? data.pop() : undefined) as Transferable[]
      let id = -1
      const p = Promise.withResolvers<ReturnType<Out[K]>>()
      if (returns) promises.set(id = lastid++, p.resolve)
      const payload: PayloadReq<Out, any> = { id, name, data: data as any, type: 'req' }
      port.postMessage(payload, { transfer })
      return p.promise
    }]
  })) as ProxiedOutFn
}
