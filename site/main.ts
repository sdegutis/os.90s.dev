const canvas = document.createElement('canvas')
canvas.width = 320
canvas.height = 180
canvas.style.imageRendering = 'pixelated'
canvas.style.backgroundColor = '#000'
canvas.style.outline = 'none'
canvas.style.cursor = 'none'
canvas.style.transform = `scale(2)`
document.body.replaceChildren(canvas)

const ctx = canvas.getContext('2d')!

const w1 = new Worker(new URL('./testworker.js', import.meta.url))

let last = 0
w1.onmessage = (msg) => {
  console.log(msg.data.d - last)
  last = msg.data.d

  // const img = msg.data.img as ImageBitmap
  // ctx.drawImage(img, 0, 0)
  // img.close()

  const pixels = msg.data.pixels as Uint8ClampedArray
  const imgdata = new ImageData(pixels, 320, 180)
  ctx.putImageData(imgdata, 0, 0)
}
