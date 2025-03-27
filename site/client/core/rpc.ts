export type PanelOrdering = 'normal' | 'bottom' | 'top'

export type FsItem = { type: 'folder' | 'file', name: string }

export interface ServerProgram {
  init(): Promise<[id: number, w: number, h: number, keymap: string[], font: string]>
  newpanel(ord: PanelOrdering, x: number, y: number, w: number, h: number): Promise<[id: number, x: number, y: number, port: MessagePort]>
  terminate(pid: number): void
  resize(w: number, h: number): void

  launch(path: string, opts: Record<string, any>): Promise<[number]>
  watchprocs(): Promise<[]>

  listdrives(): Promise<string[]>
  getfile(path: string): Promise<[content: string | undefined]>
  putfile(path: string, content: string): Promise<[]>
  listdir(path: string): Promise<FsItem[]>
  mount(name: string): Promise<[]>
  unmount(name: string): Promise<[]>
}

export interface ClientProgram {
  ping(n: number): Promise<[n: number]>
  resized(w: number, h: number): void

  keydown(key: string): void
  keyup(key: string): void

  procbegan(pid: number): void
  procended(pid: number): void
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

  cid = 0
  port
  handlers
  waiters = new Map<number, (data: any) => void>()

  constructor(port: Worker | Window | MessagePort, handlers: Handlers<In>) {
    this.port = port
    this.handlers = handlers

    port.onmessage = (msg) => {
      const args = msg.data as any[]
      const cid = args.pop() as number

      if (cid < 0) {
        this.waiters.get(-cid)?.(args)
        this.waiters.delete(-cid)
        return
      }

      if (cid > 0) args.unshift((data: any[], transfer: Transferable[]) => {
        port.postMessage([...data, -cid], { transfer })
      })

      const name = args.pop() as keyof In
      const fn = handlers[name]
      fn.apply(undefined, args)
    }
  }

  send<K extends keyof Out>(name: K, data: Parameters<Out[K]>, transfer?: Transferable[]) {
    this.port.postMessage([...data, name, 0], transfer ? { transfer } : undefined)
  }

  call<K extends keyof Out>(name: K, data: Parameters<Out[K]>, transfer?: Transferable[]) {
    const p = Promise.withResolvers<Awaited<ReturnType<Out[K]>>>()
    const cid = ++this.cid
    this.waiters.set(cid, p.resolve)
    this.port.postMessage([...data, name, cid], transfer ? { transfer } : undefined)
    return p.promise
  }

}
