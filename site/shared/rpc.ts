import { Listener } from "./listener.js"

interface Sys {
  newpanel(): void

  // adjust(x: number, y: number, w: number, h: number): void
  // blit(img: ImageBitmap): void
  // quit(): void
  // max(): void
  // min(): void
  // fullscreen(): void
  // restore(): void
}

interface Prog {

  init(id: number): void

  panel(id: number, x: number, y: number, w: number, h: number): void

  // mouseMoved(x: number, y: number): void
  // mouseDown(button: number): void
  // mouseUp(button: number): void
  // keyDown(key: string): void
  // keyUp(key: string): void
  // wheel(n: number): void
  // focus(): void
  // blur(): void
}

type EventMap<T> = { [K in keyof T]: (...args: any) => void }

function wRPC<In extends EventMap<In>, Out extends EventMap<Out>>(port: Worker | Window) {
  const listeners = new Map<keyof In, Listener<Parameters<In[keyof In]>>>()

  port.onmessage = (msg) => {
    const name = msg.data.pop() as keyof In
    listeners.get(name)?.dispatch(msg.data as Parameters<In[keyof In]>)
  }

  function send<K extends keyof Out>(name: K, data: Parameters<Out[K]>, transfer?: Transferable[]) {
    port.postMessage([...data, name], transfer ? { transfer } : undefined)
  }

  function listen<K extends keyof In>(name: K, fn: (...args: Parameters<In[K]>) => void) {
    let listener = listeners.get(name)
    if (!listener) listeners.set(name, listener = new Listener())
    return listener.watch(data => fn(...data))
  }

  function once<K extends keyof In>(name: K) {
    const p = Promise.withResolvers<Parameters<In[K]>>()
    const done = listen(name, (...args: Parameters<In[K]>) => {
      p.resolve(args)
      done()
    })
    return p.promise
  }

  return { send, listen, once }
}

export const progRPC = (wRPC<Prog, Sys>)
export const sysRPC = (wRPC<Sys, Prog>)
