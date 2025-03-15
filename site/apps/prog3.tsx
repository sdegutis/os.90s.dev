import { Program } from "../client/core/prog.js"
import { $$ } from "../client/util/jsx.js"
import { ontick } from "../client/util/ontick.js"

const prog = new Program()
await prog.init()

const view = $$(
  <view background={0x00007733} />
)

const panel = await prog.makePanel({
  size: [400, 300],
  view: view,
})









const cs = Array(400000).keys().map(() => {
  return {}
}).toArray()


const cw = 400, ch = 300
const pixels = new Uint8ClampedArray(cw * ch * 4)
const imgdata = new ImageData(pixels, cw, ch)
const grid = new Uint32Array(cw * ch)
const dv = new DataView(pixels.buffer)

setTimeout(ontick((d) => {

  for (const { } of cs) {
    const x = Math.floor(200 * Math.random())
    const y = Math.floor(150 * Math.random())
    const w = 5//Math.floor(200 / 2 * Math.random()) + 200 / 2
    const h = 5//Math.floor(150 / 2 * Math.random()) + 150 / 2
    const c = Math.floor(0xffffffff * Math.random())
    rectFill(x, y, w, h, c)
  }

  blit()

  console.log(d)

  panel.blit()

}), 1000)

function blit() {
  for (let i = 0; i < cw * ch; i++) {
    dv.setUint32(i * 4, grid[i])
  }
  view.ctx.putImageData(imgdata, 0, 0)
}

function rectFill(x: number, y: number, w: number, h: number, c: number) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      const i = yy * cw + x + xx

      const c2 = grid[i]

      const c3 = (c & c2) + ((c ^ c2) >> 1)

      grid[i] = c
    }

    // grid.fill(c, i, i + w)
  }
}






// const cs = Array(400000).keys().map(() => {
//   return {}
// }).toArray()


// const cw = 400, ch = 300
// const pixels = new Uint8ClampedArray(cw * ch * 4)
// const imgdata = new ImageData(pixels, cw, ch)
// for (let i = 0; i < cw * ch * 4; i += 4) {
//   pixels[i + 3] = 255
// }

// ontick((d) => {

//   for (const { } of cs) {
//     const x = Math.floor(200 * Math.random())
//     const y = Math.floor(150 * Math.random())
//     const w = 5//Math.floor(200 / 2 * Math.random()) + 200 / 2
//     const h = 5//Math.floor(150 / 2 * Math.random()) + 150 / 2
//     const c = Math.floor(0xffffffff * Math.random())
//     rectFill(x, y, w, h, c)
//   }

//   view.ctx.putImageData(imgdata, 0, 0)

//   console.log(d)

//   panel.blit()

// })

// function rectFill(x: number, y: number, w: number, h: number, c: number) {
//   let x1 = x
//   let y1 = y
//   let x2 = x1 + w - 1
//   let y2 = y1 + h - 1

//   const r = c >> 24 & 0xff
//   const g = c >> 16 & 0xff
//   const b = c >> 8 & 0xff
//   const a = c & 0xff

//   // if (a === 0) return

//   for (y = y1; y <= y2; y++) {
//     for (x = x1; x <= x2; x++) {
//       const i = y * cw * 4 + x * 4

//       if (a === 255) {
//         pixels[i + 0] = r
//         pixels[i + 1] = g
//         pixels[i + 2] = b
//       }
//       else {
//         const ia = (255 - a) / 255
//         const aa = (a / 255)
//         pixels[i + 0] = (pixels[i + 0] * ia) + (r * aa)
//         pixels[i + 1] = (pixels[i + 1] * ia) + (g * aa)
//         pixels[i + 2] = (pixels[i + 2] * ia) + (b * aa)
//       }
//     }
//   }
// }








// const cs = Array(30000).keys().map(() => {
//   return {}
// }).toArray()

// ontick((d) => {

//   for (const { } of cs) {
//     const x = Math.floor(200 * Math.random())
//     const y = Math.floor(150 * Math.random())
//     const w = 5//Math.floor(200 / 2 * Math.random()) + 200 / 2
//     const h = 5//Math.floor(150 / 2 * Math.random()) + 150 / 2
//     const c = Math.floor(0xffffffff * Math.random())

//     const ctx = view.ctx
//     const r = (c >> 24 & 0xff).toString(16).padStart(2, '0')
//     const g = (c >> 16 & 0xff).toString(16).padStart(2, '0')
//     const b = (c >> 8 & 0xff).toString(16).padStart(2, '0')
//     const a = (c & 0xff).toString(16).padStart(2, '0')
//     ctx.fillStyle = `#${r}${g}${b}${a}`
//     ctx.fillRect(x, y, w, h)
//   }

//   console.log(d)

//   panel.blit()

// })








// const cs = Array(1000).keys().map(i => {
//   const w = 5
//   const h = 5
//   const canvas = new OffscreenCanvas(w, h)
//   const ctx = canvas.getContext('2d')!

//   const c = 0xffffffff * Math.random()

//   const r = (c >> 24 & 0xff).toString(16).padStart(2, '0')
//   const g = (c >> 16 & 0xff).toString(16).padStart(2, '0')
//   const b = (c >> 8 & 0xff).toString(16).padStart(2, '0')
//   const a = (c & 0xff).toString(16).padStart(2, '0')
//   ctx.fillStyle = `#${r}${g}${b}${a}`
//   ctx.fillRect(0, 0, w, h)

//   const img = canvas.transferToImageBitmap()

//   return { canvas, ctx, img }
// }).toArray()

// ontick((d) => {

//   for (const c of cs) {
//     const x = Math.floor(200 * Math.random())
//     const y = Math.floor(150 * Math.random())
//     view.ctx.drawImage(c.img, x, y)
//   }

//   console.log(d)

//   panel.blit()

// })
