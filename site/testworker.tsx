import { Listener } from "./os/util/events.js"
import { wRPC, type Prog, type Sys } from "./rpc.js"

class View {

  x = 0
  y = 0
  w = 0
  h = 0

  canvas = new OffscreenCanvas(0, 0)

  resize(w: number, h: number) {
    this.canvas = new OffscreenCanvas(this.w = w, this.h = h)
  }

  move(x: number, y: number) {
    this.x = x
    this.y = y
  }

}

class Panel {

  rpc
  keys: Record<string, boolean> = Object.create(null)
  focused = false

  view = new View()

  mouseMoved = new Listener<{ x: number, y: number }>()
  mouseDown = new Listener<number>()
  mouseUp = new Listener<number>()
  keyDown = new Listener<string>()
  keyUp = new Listener<string>()
  wheel = new Listener<number>()
  focus = new Listener<void>()
  blur = new Listener<void>()

  ready

  constructor() {
    const init = Promise.withResolvers<void>()
    this.ready = init.promise

    this.rpc = wRPC<Prog, Sys>(self, {
      init: (x, y, w, h) => {
        this.view.move(x, y)
        this.view.resize(w, h)
        init.resolve()
      },
      mouseMoved: (x, y) => {
        this.mouseMoved.dispatch({ x, y })
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
    const bmp = panel.view.canvas.transferToImageBitmap()
    this.rpc('blit', [bmp], [bmp])
  }

  resize(w: number, h: number) {
    this.view.resize(w, h)
    this.rpc('adjust', [this.view.x, this.view.y, this.view.w, this.view.h])
  }

  move(x: number, y: number) {
    this.view.move(x, y)
    this.rpc('adjust', [this.view.x, this.view.y, this.view.w, this.view.h])
  }

}

const panel = new Panel()

await panel.ready

panel.mouseMoved.watch(mouse => {
  panel.move(mouse.x - panel.view.w / 2, mouse.y - panel.view.h / 2)
})

const ctx = panel.view.canvas.getContext('2d')!
const pixels = new Uint8ClampedArray(panel.view.w * panel.view.h * 4)
const imgdata = new ImageData(pixels, panel.view.w, panel.view.h)

// for (let y = 0; y < h; y++) {
//   for (let x = 0; x < w; x++) {
//     const i = y * w * 4 + x * 4
//     pixels[i + 3] = 128
//   }
// }

pixels.fill(Math.random() * 255)

ctx.putImageData(imgdata, 0, 0)
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
