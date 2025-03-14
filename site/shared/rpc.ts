import { Listener } from "./listener.js"

export type PanelPos = 'normal' | 'bottom' | 'top'

export interface ToSys {
  init(): void
  newpanel(pos: PanelPos): void
  adjpanel(id: number, x: number, y: number, w: number, h: number): void
  blitpanel(id: number, img: ImageBitmap): void
}

export interface ToProg {
  init(id: number): void
  newpanel(id: number, x: number, y: number, w: number, h: number): void
  focus(id: number): void
  blur(id: number): void
  mouseentered(id: number): void
  mouseexited(id: number): void
  mousemoved(id: number, x: number, y: number): void
  mousedown(id: number, b: number): void
  mouseup(id: number): void

  // keyDown(key: string): void
  // keyUp(key: string): void
  // wheel(n: number): void
}

type EventMap<T> = { [K in keyof T]: (...args: any) => void }

export function wRPC<In extends EventMap<In>, Out extends EventMap<Out>>(port: Worker | Window) {
  const listeners = new Map<keyof In, Listener<Parameters<In[keyof In]>>>()

  port.onmessage = (msg) => {
    const name = msg.data.pop() as keyof In
    const listener = listeners.get(name)
    if (!listener) {
      console.log('missed message', name, msg.data)
      return
    }
    listener.dispatch(msg.data as Parameters<In[keyof In]>)
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
    return new Promise<Parameters<In[K]>>(resolve => {
      const done = listen(name, (...args: Parameters<In[K]>) => {
        done()
        resolve(args)
      })
    })
  }

  return { send, listen, once }
}
