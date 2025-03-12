const c = new OffscreenCanvas(320, 180)
const ctx = c.getContext('2d')!

const pixels = new Uint8ClampedArray(320 * 180 * 4)
const imgdata = new ImageData(pixels, 320, 180)

ontick((d) => {

  for (let n = 0; n < 300; n++)
    for (let y = 0; y < 180; y++) {
      for (let x = 0; x < 320; x++) {
        let i = y * 320 * 4 + x * 4
        pixels[i + 0] = Math.random() * 255
        pixels[i + 1] = Math.random() * 255
        pixels[i + 2] = Math.random() * 255
        pixels[i + 3] = 255
      }
    }

  ctx.putImageData(imgdata, 0, 0)

  postMessage({ img: c.transferToImageBitmap() })

})

function ontick(fn: (d: number) => void) {
  (function tick(d: number) {
    fn(d)
    requestAnimationFrame(tick)
  })(performance.now())
}
