import { progRPC } from "../shared/rpc.js"
import { $$ } from "../util/jsx.js"
import { Listener } from "../util/listener.js"
import { View } from "../views/view.js"


class Root extends View {

  constructor(config: Partial<Root>) { super() }

  panel!: Panel

  // override draw(): void {
  //   super.draw()
  //   this.panel.blit()
  // }

}

class Panel {

  private rpc
  keys: Record<string, boolean> = Object.create(null)
  focused = false

  mouseMoved = new Listener<[number, number]>()
  mouseDown = new Listener<number>()
  mouseUp = new Listener<number>()
  keyDown = new Listener<string>()
  keyUp = new Listener<string>()
  wheel = new Listener<number>()
  focus = new Listener<void>()
  blur = new Listener<void>()

  ready

  frame

  constructor() {
    const init = Promise.withResolvers<void>()
    this.ready = init.promise

    this.frame = $$(<Root panel={this} />).view

    this.rpc = progRPC(self, {
      init: (x, y, w, h) => {
        this.move(x, y)
        this.resize(w, h)
        init.resolve()
      },
      mouseMoved: (x, y) => {
        this.mouseMoved.dispatch([x, y])
      },
      mouseDown: (button: number) => {
        if (!this.focused) return
        this.mouseDown.dispatch(button)
      },
      mouseUp: (button: number) => {
        if (!this.focused) return
        this.mouseUp.dispatch(button)
      },
      keyDown: (key: string) => {
        this.keys[key] = true
        if (!this.focused) return
        this.keyDown.dispatch(key)
      },
      keyUp: (key: string) => {
        this.keys[key] = false
        if (!this.focused) return
        this.keyUp.dispatch(key)
      },
      wheel: (n: number) => {
        this.wheel.dispatch(n)
      },
      focus: () => {
        this.focus.dispatch()
      },
      blur: () => {
        this.blur.dispatch()
      },
      ping: (n: number) => {
        this.rpc('pong', [n])
      },
    })
  }

  blit() {
    const bmp = this.frame.canvas.transferToImageBitmap()
    this.rpc('blit', [bmp], [bmp])
  }

  resize(w: number, h: number) {
    this.frame.resize(w, h)
    // this.content.resize(w, h)
    this.rpc('adjust', [this.frame.x, this.frame.y, this.frame.w, this.frame.h])
  }

  move(x: number, y: number) {
    this.frame.move(x, y)
    // this.content.move(x, y)
    this.rpc('adjust', [this.frame.x, this.frame.y, this.frame.w, this.frame.h])
  }

}

export const panel = new Panel()
await panel.ready
