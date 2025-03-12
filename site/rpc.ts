export type FromProg = {
  blit: { pixels: Uint8ClampedArray }
  resize: { w: number, h: number }
  move: { x: number, y: number }
}

export type ToProg = {
  open: { filepath: string }
  focus: {}
  blur: {}
}

export type Payload<T extends {}, K extends keyof T> = {
  name: K,
  data: T[K]
}

export type Handler<T extends {}, K extends keyof T> =
  (data: T[K]) => void

export type Handlers<T extends {}> =
  { [K in keyof T]: Handler<T, K> }

export class wRPC<In extends {}, Out extends {}> {

  port: Worker | Window

  constructor(port: Worker | Window, handlers: Handlers<In>) {
    this.port = port
    this.port.onmessage = (msg) => {
      const pkg = msg.data as Payload<In, any>
      handlers[pkg.name as keyof typeof handlers](pkg.data)
    }
  }

  send<K extends keyof Out>(name: K, data: Out[K]) {
    this.port.postMessage({ name, data } as Payload<Out, K>)
  }

}
