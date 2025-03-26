export type PanelOrdering = 'normal' | 'bottom' | 'top'

export interface ServerProgram {
  init(): Promise<[id: number, w: number, h: number, keymap: string[]]>
  newpanel(ord: PanelOrdering, x: number, y: number, w: number, h: number): Promise<[id: number, x: number, y: number, port: MessagePort]>
  terminate(): void
  resize(w: number, h: number): void
  getfile(path: string): Promise<[content: string | undefined]>
}

export interface ClientProgram {
  resized(w: number, h: number): void
  ping(n: number): Promise<[n: number]>
  keydown(key: string): void
  keyup(key: string): void
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

type Reply<A> = (data: A, ts: Transferable[]) => void
type Handler<T extends (...args: any) => any> = T extends (...args: infer A) => Promise<infer R> ? (reply: Reply<R>, ...args: A) => void : T
type Handlers<T extends EventMap<T>> = { [K in keyof T]: Handler<T[K]> }

export class wRPC<In extends EventMap<In>, Out extends EventMap<Out>> {

  port
  handlers

  constructor(port: Worker | Window | MessagePort, handlers: Handlers<In>) {
    this.port = port
    this.handlers = handlers

    port.onmessage = (msg) => {
      const name = msg.data.pop() as keyof In
      // const fn = handlers[name]
      // fn.apply(undefined, msg.data)
    }
  }

  send<K extends keyof Out>(name: K, data: Parameters<Out[K]>, transfer?: Transferable[]) {
    this.port.postMessage([...data, name], transfer ? { transfer } : undefined)
  }

  call<K extends keyof Out>(name: K, data: Parameters<Out[K]>, transfer?: Transferable[]): ReturnType<Out[K]> {
    this.port.postMessage([...data, name], transfer ? { transfer } : undefined)
    return new Promise(r => { }) as any
  }

}
