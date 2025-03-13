import { type Prog, type Sys, wRPC } from "./rpc.js"

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
  rpc

  x = 0
  y = 0
  w = 100
  h = 100
  image?: ImageBitmap

  constructor(path: string) {
    const absurl = new URL(path, import.meta.url)

    this.worker = new Worker(absurl, { type: 'module' })
    this.rpc = wRPC<Sys, Prog>(this.worker, {
      adjust: (x, y, w, h) => {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        redrawAllProgs()
      },

      blit: (img) => {
        this.image?.close()
        this.image = img
        redrawAllProgs()
      },
      quit: function (): void { },
      max: function (): void { },
      min: function (): void { },
      fullscreen: function (): void { },
      restore: function (): void { },
      pong: function (n: number): void { },
    })

    this.rpc('init', [this.x, this.y, this.w, this.h])
  }

  mouseMoved(x: number, y: number) {
    this.rpc('mouseMoved', [x, y])
  }

  terminate() {
    this.worker.terminate()
  }

}

function redrawAllProgs() {
  ctx.clearRect(0, 0, 320, 180)
  for (const prog of progs) {
    if (prog.image) {
      ctx.drawImage(prog.image, prog.x, prog.y)
    }
  }
}

// const url = URL.createObjectURL(new Blob([`import 'https://test.minigamemaker.com/testworker.js'`], { type: 'application/javascript' }))

const prog1 = new Program('/testworker.js')
const prog2 = new Program('/testworker.js')
const prog3 = new Program('/testworker.js')
const progs = [prog1, prog2, prog3]

// drawProgs()

const mouse = { x: 0, y: 0 }

canvas.onmousemove = (e) => {
  const x = Math.min(320 - 1, e.offsetX)
  const y = Math.min(180 - 1, e.offsetY)
  if (x === mouse.x && y === mouse.y) return
  mouse.x = x
  mouse.y = y
  prog1.mouseMoved(mouse.x, mouse.y)
}

// setInterval(() => {
//   progs.pop()?.terminate()
//   redrawAllProgs()
// }, 1000)
