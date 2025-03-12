import { wRPC, type FromProg, type ToProg } from "./rpc.js"

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

class Program {

  worker: Worker
  rpc: wRPC<FromProg, ToProg>

  x = 0
  y = 0
  w = 10
  h = 10
  imgdata = new ImageData(10, 10)

  constructor(absurl: URL) {
    this.worker = new Worker(absurl, { type: 'module' })
    this.rpc = new wRPC(this.worker, {

      adjust: ({ x, y, w, h }) => {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
      },

      blit: ({ pixels }) => {
        this.imgdata = new ImageData(pixels, this.w, this.h)
        ctx.putImageData(this.imgdata, this.x, this.y)
      },

    })
  }

}

const prog1 = new Program(new URL('./testworker.js', import.meta.url))
