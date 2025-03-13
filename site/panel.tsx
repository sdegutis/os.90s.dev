import { progRPC } from "./rpc.js"
import { Listener } from "./util/events.js"
import { $$ } from "./util/jsx.js"

export const panelView = $$(<view>

</view>).view

panelView.redraw()

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

  private frame

  constructor() {
    const init = Promise.withResolvers<void>()
    this.ready = init.promise

    this.frame = panelView

    this.rpc = progRPC(self, {
      init: (x, y, w, h) => {
        this.move(x, y)
        this.resize(w, h)
        this.blit()

        // const pix = new PixelCanvas(this.frame)
        // pix.pixels.fill(77)
        // pix.blit()

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
