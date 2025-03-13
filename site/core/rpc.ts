interface Sys {
  adjust(x: number, y: number, w: number, h: number): void
  blit(img: ImageBitmap): void
  quit(): void
  max(): void
  min(): void
  fullscreen(): void
  restore(): void
  pong(n: number): void
}

interface Prog {
  init(x: number, y: number, w: number, h: number): void
  mouseMoved(x: number, y: number): void
  mouseDown(button: number): void
  mouseUp(button: number): void
  keyDown(key: string): void
  keyUp(key: string): void
  wheel(n: number): void
  focus(): void
  blur(): void
  ping(n: number): void
}

type EventMap<T> = { [K in keyof T]: (...args: any) => void }

function wRPC<In extends EventMap<In>, Out extends EventMap<Out>>(port: Worker | Window, handlers: In) {
  port.onmessage = (msg) => {
    const name = msg.data.pop() as keyof typeof handlers
    handlers[name](...msg.data)
  }
  return <K extends keyof Out>(name: K, data: Parameters<Out[K]>, transfer?: Transferable[]) => {
    port.postMessage([...data, name], transfer ? { transfer } : undefined)
  }
}

export const progRPC = (wRPC<Prog, Sys>)
export const sysRPC = (wRPC<Sys, Prog>)
