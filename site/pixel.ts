// import type { View } from "./controls/view.js"

// export class PixelCanvas {

//   view

//   private ctx!: OffscreenCanvasRenderingContext2D
//   private imgdata!: ImageData
//   pixels!: Uint8ClampedArray

//   constructor(view: View) {
//     this.view = view
//     this.rebuild()
//     this.view.resized.watch(() => this.rebuild())
//   }

//   private rebuild() {
//     this.ctx = this.view.canvas.getContext('2d')!
//     this.pixels = new Uint8ClampedArray(this.view.w * this.view.h * 4)
//     this.imgdata = new ImageData(this.pixels, this.view.w, this.view.h)
//   }

//   blit() {
//     this.ctx.putImageData(this.imgdata, 0, 0)
//   }

// }
