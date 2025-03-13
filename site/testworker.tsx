import { wRPC, type Prog, type Sys } from "./rpc.js"

let x = Math.ceil(Math.random() * 10)
let y = Math.ceil(Math.random() * 20)
let w = Math.ceil(Math.random() * 100)
let h = Math.ceil(Math.random() * 50)

const pixels = new Uint8ClampedArray(w * h * 4)

pixels.fill(Math.random() * 255)

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = y * w * 4 + x * 4
    pixels[i + 3] = 128
  }
}


const rpc = new wRPC<Prog, Sys>(self, {
  blur: () => { },
  focus: () => { },
  open: (filepath) => { return true },
  mouseMoved: (x, y) => {
    console.log(x, y)
    rpc.send('adjust', x, y, w, h)
  },
})

// rpc.proxy.adjust()

// rpc.out.adjust()

const p = await rpc.send('newpanel', 100, 100)
console.log(p)

// await rpc.send('')

rpc.send('adjust', x, y, w, h)
rpc.send('blit', pixels)

ontick((d) => {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let i = y * w * 4 + x * 4
      pixels[i + 0] = Math.random() * 255
      pixels[i + 1] = Math.random() * 255
      pixels[i + 2] = Math.random() * 255
      // pixels[i + 3] = 255
    }
  }
  rpc.send('blit', pixels)
  // console.log('hey')
})

function ontick(fn: (d: number) => void) {
  // (function tick(d: number) {
  //   fn(d)
  //   requestAnimationFrame(tick)
  // })(performance.now())
}

console.log((<view x={3}>
</view>)[Symbol.for('jsx')])
