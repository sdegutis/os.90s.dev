import { Program } from "../client/core/prog.js"
import { $$ } from "../client/util/jsx.js"

const prog = new Program()
await prog.init()

const view = $$(
  <view background={0x00007733} />
)

const panel = await prog.makePanel({
  size: [400, 300],
  view: view,
})



const GRID_W = 320 * 1
const GRID_H = 180 * 1

const canvas = new OffscreenCanvas(320, 180)
canvas.width = GRID_W
canvas.height = GRID_H

const adapter = (await navigator.gpu.requestAdapter())!
const device = await adapter.requestDevice()

// Canvas configuration
const context = canvas.getContext("webgpu")!
const canvasFormat = navigator.gpu.getPreferredCanvasFormat()
context.configure({
  device: device,
  format: canvasFormat,
  alphaMode: 'premultiplied',
})






// Create an array representing the active state of each cell.
const cellStateArray = new Uint32Array(GRID_W * GRID_H)

// Create a storage buffer to hold the cell state.
const cellStateStorage = device.createBuffer({
  label: "Cell State",
  size: cellStateArray.byteLength,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
})




const n = 0.8
const vertices = new Float32Array([-n, -n, n, -n, n, n, n, n, -n, n, -n, -n])

const vertexBuffer = device.createBuffer({
  label: "Cell vertices",
  size: vertices.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
})

device.queue.writeBuffer(vertexBuffer, 0, vertices)


const cellShaderModule = device.createShaderModule({
  label: "Cell shader",
  code: await fetch('/vshader.wgsl').then(r => r.text())
})


const cellPipeline = device.createRenderPipeline({
  label: "Cell pipeline",
  layout: "auto",
  vertex: {
    module: cellShaderModule,
    entryPoint: "vertexMain",
    buffers: [{
      arrayStride: 8,
      attributes: [{
        format: "float32x2",
        offset: 0,
        shaderLocation: 0, // Position, see vertex shader
      }],
    }]
  },
  fragment: {
    module: cellShaderModule,
    entryPoint: "fragmentMain",
    targets: [{
      format: canvasFormat
    }]
  }
})






// Create a uniform buffer that describes the grid.
const uniformArray = new Float32Array([GRID_W, GRID_H])
const uniformBuffer = device.createBuffer({
  label: "Grid Uniforms",
  size: uniformArray.byteLength,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
})
device.queue.writeBuffer(uniformBuffer, 0, uniformArray)

const bindGroup = device.createBindGroup({
  label: "Cell renderer bind group",
  layout: cellPipeline.getBindGroupLayout(0),
  entries: [{
    binding: 0,
    resource: { buffer: uniformBuffer }
  }, {
    binding: 1,
    resource: { buffer: cellStateStorage }
  }],
})


let s = 0

function render() {

  cellStateArray.fill(0)
  for (let i = s++; i < cellStateArray.length; i += 21) {
    cellStateArray[i] = Math.floor(Math.random() * 0xffffffff)
    // cellStateArray[i] = 0x330000ff;
  }
  device.queue.writeBuffer(cellStateStorage, 0, cellStateArray)



  // Clear the canvas with a render pass
  const encoder = device.createCommandEncoder()

  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: "clear",
      clearValue: [0, 0, 0, 0],
      storeOp: "store",
    }]
  })


  pass.setPipeline(cellPipeline)
  pass.setVertexBuffer(0, vertexBuffer)
  pass.setBindGroup(0, bindGroup)
  pass.draw(vertices.length / 2, GRID_W * GRID_H) // 6 vertices

  pass.end()


  device.queue.submit([(encoder.finish())])

  device.queue.onSubmittedWorkDone().then(() => {
    // panel.ctx.fillStyle = '#0004'
    // panel.ctx.fillRect(0, 0, panel.ctx.canvas.width, panel.ctx.canvas.height)
    panel.ctx.drawImage(canvas, 0, 0)
    panel.blit()
  })

  console.log('here')
}

render()
setInterval(render, 1000)






// const cs = Array(10_000).keys().map(() => {
//   return {}
// }).toArray()


// const cw = 400, ch = 300
// const grid = new Uint32Array(cw * ch)

// // grid.fill(0x000000ff)

// const pixels = new Uint8ClampedArray(cw * ch * 4)
// const imgdata = new ImageData(pixels, cw, ch)
// const dv = new DataView(pixels.buffer)

// setTimeout(ontick((d) => {

//   for (const { } of cs) {
//     const x = Math.floor(200 * Math.random())
//     const y = Math.floor(150 * Math.random())
//     const w = 50//Math.floor(200 / 2 * Math.random()) + 200 / 2
//     const h = 50//Math.floor(150 / 2 * Math.random()) + 150 / 2
//     const c = Math.floor(0xffffffff * Math.random())
//     rectFill(x, y, w, h, c)
//   }

//   for (let i = 0; i < cw * ch; i++) {
//     dv.setUint32(i * 4, grid[i])
//   }

//   view.ctx.putImageData(imgdata, 0, 0)

//   console.log(d)

//   panel.blit()

// }), 5000)

// function rectFill(x: number, y: number, w: number, h: number, c1: number) {
//   for (let yy = y; yy < y + h; yy++) {
//     for (let xx = 0; xx < w; xx++) {
//       const i = yy * cw + x + xx


//       const r2 = c1 >> 24 & 0xff
//       const g2 = c1 >> 16 & 0xff
//       const b2 = c1 >> 8 & 0xff
//       const a2 = c1 & 0xff

//       const c2 = grid[i]

//       const r1 = c2 >> 24 & 0xff
//       const g1 = c2 >> 16 & 0xff
//       const b1 = c2 >> 8 & 0xff
//       const a1 = c2 & 0xff

//       // const r3 = r1 * a1 * (1 - a2) + r2 * a2
//       // const g3 = g1 * a1 * (1 - a2) + g2 * a2
//       // const b3 = b1 * a1 * (1 - a2) + b2 * a2
//       // const a3 = a1 * (1 - a2) + a2



//       // const a3 = a1 + (a2 * (0xff - a1) / 0xff)
//       // const r3 = (r1 * a1 + r2 * a2 * (0xff - a1) / 0xff) / a3
//       // const g3 = (g1 * a1 + g2 * a2 * (0xff - a1) / 0xff) / a3
//       // const b3 = (b1 * a1 + b2 * a2 * (0xff - a1) / 0xff) / a3




//       const ia = (0xff - a2) / 0xff
//       const aa = (a2 / 0xff)
//       const r3 = (r1 * ia) + (r2 * aa)
//       const g3 = (g1 * ia) + (g2 * aa)
//       const b3 = (b1 * ia) + (b2 * aa)
//       const a3 = (a1 + a2) / 2

//       // const c3 = (c1 & c2) + ((c1 ^ c2) >> 1)



//       const c4 = (r3 << 24) | (g3 << 16) | (b3 << 8) | a3

//       // console.log(c1)
//       // console.log(c1.toString(16))

//       grid[i] = c4
//     }

//     // grid.fill(c, i, i + w)
//   }
// }




// function rectFill2(x: number, y: number, w: number, h: number, c: number) {
//   if ((c & 0xff) === 0xff) {
//     while (h--) {
//       const i = y++ * cw + x
//       grid.fill(c, i, i + w)
//     }
//     return
//   }

//   for (let yy = 0; yy < h; yy++) {
//     for (let xx = 0; xx < w; xx++) {
//       const i = (yy + y) * cw + x + xx
//       grid[i] = blendColors(grid[i], c)
//     }
//   }
// }

// function blendColors(c1: number, c2: number) {
//   const r1 = c1 >> 24 & 0xff
//   const g1 = c1 >> 16 & 0xff
//   const b1 = c1 >> 8 & 0xff
//   const a1 = c1 & 0xff

//   const r2 = c2 >> 24 & 0xff
//   const g2 = c2 >> 16 & 0xff
//   const b2 = c2 >> 8 & 0xff
//   const a2 = c2 & 0xff

//   const ia = (0xff - a2) / 0xff
//   const aa = (a2 / 0xff)
//   const r3 = (r1 * ia) + (r2 * aa)
//   const g3 = (g1 * ia) + (g2 * aa)
//   const b3 = (b1 * ia) + (b2 * aa)
//   const a3 = (a1 + a2) / 2
//   // const a3 = a1

//   return (r3 << 24) | (g3 << 16) | (b3 << 8) | a3
// }

// // function intToRgb(c: number) {
// //   const r = c >> 24 & 0xff
// //   const g = c >> 16 & 0xff
// //   const b = c >> 8 & 0xff
// //   const a = c & 0xff
// //   return [r, g, b, a]
// // }

// // function rgbToInt(r: number, g: number, b: number, a: number) {
// //   return (r << 24) | (g << 16) | (b << 8) | a
// // }







// const cs = Array(400000).keys().map(() => {
//   return {}
// }).toArray()


// const cw = 400, ch = 300
// const pixels = new Uint8ClampedArray(cw * ch * 4)
// const imgdata = new ImageData(pixels, cw, ch)
// for (let i = 0; i < cw * ch * 4; i += 4) {
//   pixels[i + 3] = 255
// }

// setTimeout(ontick((d) => {

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

// }), 1000)

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








// const cs = Array(1_000).keys().map(() => {
//   const x = Math.floor(300 * Math.random())
//   const y = Math.floor(200 * Math.random())
//   const w = Math.floor(200 / 2 * Math.random()) + 200 / 2
//   const h = Math.floor(150 / 2 * Math.random()) + 150 / 2
//   const c = Math.floor(0xffffffff * Math.random())

//   const r = (c >> 24 & 0xff).toString(16).padStart(2, '0')
//   const g = (c >> 16 & 0xff).toString(16).padStart(2, '0')
//   const b = (c >> 8 & 0xff).toString(16).padStart(2, '0')
//   const a = (c & 0xff).toString(16).padStart(2, '0')

//   const cstr = `#${r}${g}${b}${a}`

//   const can = new OffscreenCanvas(w, h)
//   const ctx = can.getContext('2d')!
//   ctx.fillStyle = cstr
//   ctx.fillRect(0, 0, w, h)

//   const img = can.transferToImageBitmap()

//   return { x, y, w, h, cstr, img }
// }).toArray()

// setTimeout(ontick((d) => {

//   for (const { img, x, y } of cs) {
//     view.ctx.drawImage(img, x, y)
//   }

//   console.log(d)

//   panel.blit()

// }), 5000)










// const cs = Array(2000).keys().map(() => {

//   const spr: number[] = []
//   for (let y = 0; y < 8; y++) {
//     for (let x = 0; x < 8; x++) {
//       const c = Math.floor(0xffffffff * Math.random())
//       spr.push(c)
//     }
//   }

//   function fillrect(px: number, py: number, ctx: OffscreenCanvasRenderingContext2D) {
//     for (let i = 0; i < 8 * 8; i++) {
//       const x = i % 8
//       const y = Math.floor(i / 8)
//       const c = spr[i]
//       ctx.fillStyle = '#' + c.toString(16).padStart(8, '0')
//       ctx.fillRect(px + x, py + y, 1, 1)
//     }
//   }

//   const c = new OffscreenCanvas(8, 8)
//   fillrect(0, 0, c.getContext('2d')!)
//   const img = c.transferToImageBitmap()

//   const img2 = new Image(8, 8)
//   img2

//   return { img, fillrect }

// }).toArray()

// const ctx = panel.ctx

// setTimeout(ontick((d) => {

//   for (const o of cs) {
//     const x = Math.floor((400 - 8) * Math.random())
//     const y = Math.floor((300 - 8) * Math.random())

//     o.fillrect(x, y, ctx)

//     // ctx.drawImage(img, x, y)

//   }

//   console.log(d)

//   panel.blit()

// }), 1000)

