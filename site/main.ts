import { wRPC, type Prog, type Sys } from "./rpc.js"

const canvas = document.createElement('canvas')
canvas.width = 320
canvas.height = 180
canvas.style.imageRendering = 'pixelated'
canvas.style.backgroundColor = '#000'
canvas.style.outline = 'none'
canvas.style.cursor = 'none'
document.body.replaceChildren(canvas)
new ResizeObserver(() => {
  const rect = canvas.parentElement!.getBoundingClientRect()
  let w = 320, h = 180, s = 1
  while ((w += 320) <= rect.width && (h += 180) <= rect.height) s++
  canvas.style.transform = `scale(${s})`
}).observe(canvas.parentElement!)




const ctx = canvas.getContext('2d')!

class Program {

  worker: Worker
  rpc: wRPC<Sys, Prog>

  x = 0
  y = 0
  w = 10
  h = 10
  imgdata = new ImageData(10, 10)

  constructor(absurl: URL) {
    this.worker = new Worker(absurl, { type: 'module' })
    this.rpc = new wRPC<Sys, Prog>(this.worker, {

      newpanel: (w, h) => {
        return Math.random()
      },

      adjust: (x, y, w, h) => {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
      },

      blit: (pixels) => {
        this.imgdata = new ImageData(pixels, this.w, this.h)
        redrawAllProgs()
      },

    })
  }

  terminate() {
    this.worker.terminate()
  }

}

function redrawAllProgs() {
  for (const prog of progs) {
    ctx.putImageData(prog.imgdata, prog.x, prog.y)
  }
}

const prog1 = new Program(new URL('./testworker.js', import.meta.url))
const prog2 = new Program(new URL('./testworker.js', import.meta.url))
const prog3 = new Program(new URL('./testworker.js', import.meta.url))
const progs = [prog1, prog2, prog3]

// drawProgs()

canvas.onmousemove = (e) => {

  e.preventDefault()

}
