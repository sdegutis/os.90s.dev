const pixels = new Uint8ClampedArray(320 * 180 * 4)

// pixels.fill(255)

import { wRPC, type FromProg, type ToProg } from "./rpc.js"

const rpc = new wRPC<ToProg, FromProg>(self, {
  blur: () => { },
  focus: () => { },
  open: ({ filepath }) => { },
})

rpc.send('blit', { pixels })

// ontick((d) => {

//   for (let y = 0; y < 180; y++) {
//     for (let x = 0; x < 320; x++) {
//       let i = y * 320 * 4 + x * 4
//       pixels[i + 0] = Math.random() * 255
//       pixels[i + 1] = Math.random() * 255
//       pixels[i + 2] = Math.random() * 255
//       pixels[i + 3] = 255
//     }
//   }

//   postMessage({ pixels })

// })

// function ontick(fn: (d: number) => void) {
//   (function tick(d: number) {
//     fn(d)
//     requestAnimationFrame(tick)
//   })(performance.now())
// }
