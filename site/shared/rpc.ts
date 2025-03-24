import { Listener } from "./listener.js"

export type PanelOrdering = 'normal' | 'bottom' | 'top'

export interface ServerProgram {
  init(): void
  newpanel(ord: PanelOrdering, x: number, y: number, w: number, h: number): void
  terminate(): void
  resize(w: number, h: number): void
  pong(n: number): void
}

export interface ClientProgram {
  init(id: number, w: number, h: number, keymap: string[]): void
  resized(w: number, h: number): void
  ping(n: number): void
  keydown(key: string): void
  keyup(key: string): void
  newpanel(id: number, x: number, y: number, port: MessagePort): void
}

export interface ServerPanel {
  adjust(x: number, y: number, w: number, h: number): void
  blit(img: ImageBitmap): void
  close(): void
  focus(): void
  cursor(data: string): void
}

export interface ClientPanel {
  focus(): void
  blur(): void
  mouseentered(): void
  mouseexited(): void
  mousemoved(x: number, y: number): void
  mousedown(b: number): void
  mouseup(): void
  wheel(x: number, y: number): void
  needblit(): void
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
