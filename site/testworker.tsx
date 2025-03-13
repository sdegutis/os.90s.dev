import { Listener } from "./os/util/events.js"
import { wRPC, type Prog, type Sys } from "./rpc.js"

class View {

  x = 0
  y = 0
  w = 0
  h = 0

  canvas = new OffscreenCanvas(0, 0)

  resized = new Listener<View>()
  moved = new Listener<View>()

  resize(w: number, h: number) {
    this.canvas = new OffscreenCanvas(this.w = w, this.h = h)
    this.resized.dispatch(this)
  }

  move(x: number, y: number) {
    this.x = x
    this.y = y
    this.moved.dispatch(this)
  }

}

class PixelCanvas {

  view

  private ctx!: OffscreenCanvasRenderingContext2D
  private imgdata!: ImageData
  pixels!: Uint8ClampedArray

  constructor(view: View) {
    this.view = view
    this.rebuild()
    this.view.resized.watch(() => this.rebuild())
  }

  private rebuild() {
    this.ctx = this.view.canvas.getContext('2d')!
    this.pixels = new Uint8ClampedArray(this.view.w * this.view.h * 4)
    this.imgdata = new ImageData(this.pixels, this.view.w, this.view.h)
  }

  blit() {
    this.ctx.putImageData(this.imgdata, 0, 0)
  }

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

  private frame = new View()
  content = new View()

  constructor() {
    const init = Promise.withResolvers<void>()
    this.ready = init.promise

    this.rpc = wRPC<Prog, Sys>(self, {
      init: (x, y, w, h) => {
        this.move(x, y)
        this.resize(w, h)

        const pix = new PixelCanvas(this.frame)
        pix.pixels.fill(255)
        pix.blit()

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
    this.content.resize(w, h)
    this.rpc('adjust', [this.frame.x, this.frame.y, this.frame.w, this.frame.h])
  }

  move(x: number, y: number) {
    this.frame.move(x, y)
    this.content.move(x, y)
    this.rpc('adjust', [this.frame.x, this.frame.y, this.frame.w, this.frame.h])
  }

}

const panel = new Panel()
await panel.ready

const pix = new PixelCanvas(panel.content)

// for (let y = 0; y < h; y++) {
//   for (let x = 0; x < w; x++) {
//     const i = y * w * 4 + x * 4
//     pixels[i + 3] = 128
//   }
// }

pix.pixels.fill(Math.random() * 255)

pix.blit()

panel.blit()


ontick((d) => {
  // // for (let n = 0; n < 10; n++)
  // for (let y = 0; y < h; y++) {
  //   for (let x = 0; x < w; x++) {
  //     let i = y * w * 4 + x * 4
  //     pixels[i + 0] = Math.random() * 255
  //     pixels[i + 1] = Math.random() * 255
  //     pixels[i + 2] = Math.random() * 255
  //     // pixels[i + 3] = 255
  //   }
  // }

  // ctx.putImageData(imgdata, 0, 0)
  // panel.blit()
})

function ontick(fn: (d: number) => void) {
  (function tick(d: number) {
    fn(d)
    requestAnimationFrame(tick)
  })(performance.now())
}

console.log(
  <view x={3}>
    hi
  </view>
)
