import { Listener } from "./listener.js"

export type PanelPos = 'normal' | 'bottom' | 'top'

export interface ServerSys {
  init(): void
  newpanel(pos: PanelPos): void
}

export interface ClientProg {
  init(id: number): void
  newpanel(id: number, x: number, y: number, w: number, h: number, port: MessagePort): void
  // keyDown(key: string): void
  // keyUp(key: string): void
}

export interface ServerPanel {
  adjust(id: number, x: number, y: number, w: number, h: number): void
  blit(id: number, img: ImageBitmap): void
}

export interface ClientPanel {
  focus(): void
  blur(): void
  mouseentered(): void
  mouseexited(): void
  mousemoved(x: number, y: number): void
  mousedown(b: number): void
  mouseup(): void
  wheel(n: number): void
}

type EventMap<T> = { [K in keyof T]: (...args: any) => void }

export function wRPC<In extends EventMap<In>, Out extends EventMap<Out>>(port: Worker | Window | MessagePort) {
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
