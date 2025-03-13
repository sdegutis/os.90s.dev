export interface Sys {
  adjust(x: number, y: number, w: number, h: number): void
  blit(img: ImageBitmap): void
}

export interface Prog {
  mouseDown(button: number): void
  mouseMoved(x: number, y: number): void
  mouseUp(button: number): void
  keyDown(key: string): void
  keyUp(key: string): void
  wheel(n: number): void
  focus(): void
  blur(): void
}

type EventMap<T> = { [K in keyof T]: (...args: any) => void }

export function wRPC<In extends EventMap<In>, Out extends EventMap<Out>>(port: Worker | Window, handlers: In) {
  port.onmessage = (msg) => {
    const [name, ...data] = msg.data
    handlers[name as keyof typeof handlers](...data)
  }
  return <K extends keyof Out>(name: K, data: Parameters<Out[K]>, transfer?: Transferable[]) => {
    port.postMessage([name, ...data], transfer ? { transfer } : undefined)
  }
}
