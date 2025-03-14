
export function setupCanvas() {
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
  return { ctx, canvas }
}

// export function start() {



//   // class Program {

//   //   worker: Worker
//   //   rpc

//   //   x = 0
//   //   y = 0
//   //   w = 100
//   //   h = 100
//   //   image?: ImageBitmap

//   //   unlisteners = new Set<() => void>()

//   //   constructor(path: string) {
//   //     const absurl = new URL(path, import.meta.url)

//   //     this.worker = new Worker(absurl, { type: 'module' })
//   //     this.rpc = sysRPC(this.worker, {
//   //       // adjust: (x, y, w, h) => {
//   //       //   this.x = x
//   //       //   this.y = y
//   //       //   this.w = w
//   //       //   this.h = h
//   //       //   // redrawAllProgs()
//   //       // },
//   //       // blit: (img) => {
//   //       //   this.image?.close()
//   //       //   this.image = img
//   //       //   // redrawAllProgs()
//   //       // },
//   //       // quit: () => { },
//   //       // max: () => { },
//   //       // min: () => { },
//   //       // fullscreen: () => { },
//   //       // restore: () => { },
//   //       // pong: (n: number) => { },
//   //     })

//   //     // this.unlisteners.add(mouseDown.watch(button => { this.rpc('mouseDown', [button]) }))
//   //     // this.unlisteners.add(mouseMoved.watch(mouse => { this.rpc('mouseMoved', mouse) }))

//   //     // this.x = (last?.x ?? 0) + 20
//   //     // this.y = (last?.y ?? 0) + 20
//   //     // last = this

//   //     // this.rpc('init', [this.x, this.y, this.w, this.h])
//   //   }

//   //   terminate() {
//   //     this.unlisteners.forEach(fn => fn())
//   //     this.worker.terminate()
//   //   }

//   // }

//   // function redrawAllProgs() {
//   //   ctx.clearRect(0, 0, 320, 180)
//   //   for (const prog of progs) {
//   //     if (prog.image) {
//   //       ctx.drawImage(prog.image, prog.x, prog.y)
//   //     }
//   //   }
//   // }

//   // let last: Program | undefined
//   // // const mouseDown = new Listener<number>()
//   // // const mouseMoved = new Listener<[number, number]>()

//   // // const url = URL.createObjectURL(new Blob([`import 'https://test.minigamemaker.com/testworker.js'`], { type: 'application/javascript' }))
//   // const prog1 = new Program('/apps/prog1.js')
//   // // const prog2 = new Program('/apps/prog1.js')
//   // // const prog3 = new Program('/apps/prog1.js')
//   // const progs = [prog1]

//   // redrawAllProgs()

//   // canvas.onkeydown = (e) => { }
//   // canvas.onkeyup = (e) => { }
//   // canvas.onmousedown = (e) => { }
//   // canvas.onmouseup = (e) => { }
//   // canvas.onwheel = (e) => { }

//   // const mouse = { x: 0, y: 0 }
//   // canvas.onmousemove = (e) => {
//   //   const x = Math.min(320 - 1, e.offsetX)
//   //   const y = Math.min(180 - 1, e.offsetY)
//   //   if (x === mouse.x && y === mouse.y) return
//   //   mouse.x = x
//   //   mouse.y = y
//   //   // mouseMoved.dispatch([mouse.x, mouse.y])
//   // }

//   // setInterval(() => {
//   //   progs.pop()?.terminate()
//   //   redrawAllProgs()
//   // }, 1000)

// }
