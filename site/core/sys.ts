
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

//   // // const url = URL.createObjectURL(new Blob([`import 'https://test.minigamemaker.com/testworker.js'`], { type: 'application/javascript' }))
//   // const prog1 = new Program('/apps/prog1.js')
//   // // const prog2 = new Program('/apps/prog1.js')
//   // // const prog3 = new Program('/apps/prog1.js')
//   // const progs = [prog1]
