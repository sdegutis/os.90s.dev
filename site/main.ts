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

  constructor(absurl: URL) {

    this.worker = new Worker(absurl, { type: 'module' })

    this.rpc = new wRPC(this.worker, {
      blit: ({ pixels }) => {
        const imgdata = new ImageData(pixels, 320, 180)
        ctx.putImageData(imgdata, 0, 0)
      },
      move: ({ x, y }) => { },
      resize: ({ w, h }) => { },
    })

  }

}

const prog1 = new Program(new URL('./testworker.js', import.meta.url))
