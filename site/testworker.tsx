import { Prog, Sys, wRPC } from "./rpc.js"

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


const rpc = wRPC<typeof Prog, typeof Sys>(Sys, self, {
  blur: () => { },
  focus: () => { },
  open: (filepath) => { return true },
  mouseMoved: (x, y) => {
    // console.log(x, y)
    rpc.adjust(x - 320 / 2, y - 180 / 2, w, h)
  },
})

rpc.adjust(x, y, w, h)

ctx.putImageData(imgdata, 0, 0)
const bmp = c.transferToImageBitmap()
rpc.blit(bmp, [bmp])

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
  rpc.blit(bmp, [bmp])
})

function ontick(fn: (d: number) => void) {
  // (function tick(d: number) {
  //   fn(d)
  //   requestAnimationFrame(tick)
  // })(performance.now())
}

console.log((<view x={3}>
</view>)[Symbol.for('jsx')])
