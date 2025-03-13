import { Listener } from "./os/util/events.js"
import { wRPC, type Prog, type Sys } from "./rpc.js"

let x = Math.ceil(Math.random() * 10)
let y = Math.ceil(Math.random() * 20)
let w = 320
let h = 180

const c = new OffscreenCanvas(w, h)
const ctx = c.getContext('2d')!

const pixels = new Uint8ClampedArray(w * h * 4)
const imgdata = new ImageData(pixels, w, h)

pixels.fill(Math.random() * 255)

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = y * w * 4 + x * 4
    pixels[i + 3] = 128
  }
}

class System {

  rpc
  keys: Record<string, boolean> = Object.create(null)
  focused = false

  mouseMoved = new Listener<{ x: number, y: number }>()
  mouseDown = new Listener<number>()
  mouseUp = new Listener<number>()
  keyDown = new Listener<string>()
  keyUp = new Listener<string>()
  wheel = new Listener<number>()
  focus = new Listener<void>()
  blur = new Listener<void>()

  constructor() {
    this.rpc = wRPC<Prog, Sys>(self, {
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
        rpc('pong', [n])
      },
    })
  }

}

const sys = new System()
const rpc = sys.rpc

rpc('adjust', [x - 320 / 2, y - 180 / 2, w, h])

// rpc('')

rpc('adjust', [x, y, w, h])

ctx.putImageData(imgdata, 0, 0)
const bmp = c.transferToImageBitmap()
rpc('blit', [bmp], [bmp])

ontick((d) => {
  // for (let n = 0; n < 10; n++)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let i = y * w * 4 + x * 4
      pixels[i + 0] = Math.random() * 255
      pixels[i + 1] = Math.random() * 255
      pixels[i + 2] = Math.random() * 255
      // pixels[i + 3] = 255
    }
  }

  ctx.putImageData(imgdata, 0, 0)
  const bmp = c.transferToImageBitmap()
  rpc('blit', [bmp], [bmp])
})

function ontick(fn: (d: number) => void) {
  // (function tick(d: number) {
  //   fn(d)
  //   requestAnimationFrame(tick)
  // })(performance.now())
}

console.log(
  <view x={3}>
    hi
  </view>
)
