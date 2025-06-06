
const GRID_W = 320
const GRID_H = 180

const canvas = document.createElement("canvas")

canvas.width = GRID_W
canvas.height = GRID_H

canvas.style.imageRendering = 'pixelated'
canvas.style.backgroundColor = '#000'
canvas.style.outline = 'none'
canvas.style.cursor = 'none'

document.body.replaceChildren(canvas)

canvas.tabIndex = 1
canvas.focus()

new ResizeObserver(() => {
  const rect = canvas.parentElement!.getBoundingClientRect()
  let w = GRID_W, h = GRID_H, s = 1
  while (
    (w += GRID_W) <= rect.width &&
    (h += GRID_H) <= rect.height) s++
  canvas.style.transform = `scale(${s})`
}).observe(canvas.parentElement!)


const adapter = (await navigator.gpu.requestAdapter())!
const device = await adapter.requestDevice()
const context = canvas.getContext('webgpu')!
const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
context.configure({
  device,
  format: presentationFormat,
})







const rectsmodule = device.createShaderModule({
  label: 'rectsmodule',
  code: `
    struct Rect {
      x: i32,
      w: i32,
      y: i32,
      h: i32,
      c: u32,
    };

    struct Output {
      @builtin(position) pos: vec4f,
      @location(0) @interpolate(flat) col: vec4f,
    };

    struct Input {
      @builtin(vertex_index) vertexIndex: u32,
      @builtin(instance_index) instanceIndex: u32,
    };

    @group(0) @binding(0) var<storage, read> rects: array<Rect>;

    @vertex fn vs(input: Input) -> Output {
      let rect = rects[input.instanceIndex];

      let cx1: f32 = f32(rect.x);
      let cx2: f32 = f32(rect.x + rect.w);
      let cy1: f32 = f32(rect.y);
      let cy2: f32 = f32(rect.y + rect.h);
      
      let x1: f32 = (cx1 - 160) / 160f;
      let x2: f32 = (cx2 - 160) / 160f;
      let y1: f32 = (cy1 -  90) / -90f;
      let y2: f32 = (cy2 -  90) / -90f;

      let verts = array(
        vec2f(x1,y1),
        vec2f(x2,y1),
        vec2f(x1,y2),
        vec2f(x1,y2),
        vec2f(x2,y2),
        vec2f(x2,y1),
      );

      let c = rect.c;
      let r = f32((c >> 24) & 0xff) / 255f;
      let g = f32((c >> 16) & 0xff) / 255f;
      let b = f32((c >>  8) & 0xff) / 255f;
      let a = f32(c & 0xff) / 255f;

      var out: Output;
      out.pos = vec4f(verts[input.vertexIndex], 0.0, 1.0);
      out.col = vec4f(r,g,b,a);
      return out;
    }

    @fragment fn fs(input: Output) -> @location(0) vec4f {
      if (input.col.a < 0.01) {
        discard;
      }
      return input.col;
    }
  `,
})

const rectspipeline = device.createRenderPipeline({
  label: 'draw rects',
  layout: 'auto',
  vertex: {
    entryPoint: 'vs',
    module: rectsmodule,
  },
  fragment: {
    entryPoint: 'fs',
    module: rectsmodule,
    targets: [{
      format: presentationFormat,

      blend: {
        color: {
          operation: 'add',
          srcFactor: 'src-alpha',
          dstFactor: 'one-minus-src-alpha',
        },
        alpha: {},
      },

    }],
  },
})



const randint = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min

const rectgroups = Array(100).keys().map(() => {

  const numrects = 10000

  const rectsData = new Int32Array(numrects * 5)

  const rectsStorage = device.createBuffer({
    label: 'rects',
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    size: rectsData.length * 4,
  })

  let bindgroup = device.createBindGroup({
    label: 'bindgrup1',
    layout: rectspipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: rectsStorage } },
    ]
  })

  update()

  const rect = { x: 0, y: 0, w: 0, h: 0 }

  for (let i = 0; i < numrects; i++) {
    // rectsData[(i * 5) + 0] = 1
    // rectsData[(i * 5) + 1] = 3
    // rectsData[(i * 5) + 2] = 1
    // rectsData[(i * 5) + 3] = 3
    // rectsData[(i * 5) + 4] = 0xff000033
    rectsData[(i * 5) + 0] = rect.x = randint(0, 320 - 10)
    rectsData[(i * 5) + 1] = rect.w = Math.min(320 - rect.x, randint(1, 320 / 10))
    rectsData[(i * 5) + 2] = rect.y = randint(0, 180 - 10)
    rectsData[(i * 5) + 3] = rect.h = Math.min(180 - rect.y, randint(1, 180 / 10))
    rectsData[(i * 5) + 4] = randint(0, 0xffffffff)
  }

  device.queue.writeBuffer(rectsStorage, 0, rectsData)

  function update() {

  }

  return { bindgroup, numrects, update, rect }

}).toArray()

function drawrects(pass: GPURenderPassEncoder) {

  for (const group of rectgroups) {

    pass.setScissorRect(group.rect.x, group.rect.y, group.rect.w, group.rect.h)
    // pass.setScissorRect(randint(20, 40), randint(20, 40), randint(50, 320 - 40), randint(50, 180 - 40))

    // group.update()

    pass.setPipeline(rectspipeline)
    pass.setBindGroup(0, group.bindgroup)
    pass.draw(6, group.numrects)

    // pass.setScissorRect(0, 0, 320, 180)
  }


}


































const pointsmodule = device.createShaderModule({
  label: 'pointsmodule',
  code: `
    struct Output {
      @builtin(position) pos: vec4f,
      @location(0) @interpolate(flat) col: vec4f,
    };

    struct Input {
      @builtin(vertex_index) vertexIndex: u32,
    };

    struct Pixel {
      pos: vec2f,
      r: f32,
      g: f32,
      b: f32,
      a: f32,
    };

    @group(0) @binding(0) var<storage, read> pixels: array<Pixel>;

    @vertex fn vs(input: Input) -> Output {
      let pos = pixels[input.vertexIndex];

      let x1: f32 = (pos.pos.x+1 - 160) / 160f;
      let y1: f32 = (pos.pos.y+1 -  90) / -90f;

      var out: Output;
      out.pos = vec4f(x1,y1,0,1);
      out.col = vec4f(pos.r,pos.g,pos.b,pos.a);
      return out;
    }

    @fragment fn fs(input: Output) -> @location(0) vec4f {
      return input.col;
    }
  `,
})

const pointspipeline = device.createRenderPipeline({
  label: 'draw points',
  primitive: { topology: 'point-list' },
  layout: 'auto',
  vertex: {
    entryPoint: 'vs',
    module: pointsmodule,
  },
  fragment: {
    entryPoint: 'fs',
    module: pointsmodule,
    targets: [{
      format: presentationFormat,

      blend: {
        color: {
          operation: 'add',
          srcFactor: 'src-alpha',
          dstFactor: 'one-minus-src-alpha',
        },
        alpha: {},
      },

    }],
  },
})



const pointgroups = Array(1).keys().map(() => {

  const numpoints = 10000

  const pointsData = new Float32Array(numpoints * 6)

  const pointsStorage = device.createBuffer({
    label: 'points',
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    size: pointsData.length * 4,
  })

  let bindgroup = device.createBindGroup({
    label: 'bindgrup1',
    layout: pointspipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: pointsStorage } },
    ]
  })

  update()

  for (let i = 0; i < numpoints; i++) {
    // pointsData[(i * 5) + 0] = 1
    // pointsData[(i * 5) + 1] = 3
    // pointsData[(i * 5) + 2] = 1
    // pointsData[(i * 5) + 3] = 3
    // pointsData[(i * 5) + 4] = 0xff000033
    pointsData[(i * 6) + 0] = randint(0, 320 - 10)
    pointsData[(i * 6) + 1] = randint(0, 180 - 10)
    pointsData[(i * 6) + 2] = Math.random()
    pointsData[(i * 6) + 3] = Math.random()
    pointsData[(i * 6) + 4] = Math.random()
    pointsData[(i * 6) + 5] = Math.random()
  }
  device.queue.writeBuffer(pointsStorage, 0, pointsData)

  function update() {

    // for (let i = 0; i < numpoints; i++) {
    //   // pointsData[(i * 5) + 0] = 1
    //   // pointsData[(i * 5) + 1] = 3
    //   // pointsData[(i * 5) + 2] = 1
    //   // pointsData[(i * 5) + 3] = 3
    //   // pointsData[(i * 5) + 4] = 0xff000033
    //   pointsData[(i * 6) + 0] = randint(0, 320 - 10)
    //   pointsData[(i * 6) + 1] = randint(0, 180 - 10)
    //   pointsData[(i * 6) + 2] = Math.random()
    //   pointsData[(i * 6) + 3] = Math.random()
    //   pointsData[(i * 6) + 4] = Math.random()
    //   pointsData[(i * 6) + 5] = Math.random()
    // }
    // device.queue.writeBuffer(pointsStorage, 0, pointsData)

  }

  return { bindgroup, numpoints, update }

}).toArray()

function drawpoints(pass: GPURenderPassEncoder) {

  for (const group of pointgroups) {

    group.update()

    pass.setPipeline(pointspipeline)
    pass.setBindGroup(0, group.bindgroup)
    pass.draw(group.numpoints)
  }


}



const mousemodule = device.createShaderModule({
  label: 'mousemodule',
  code: `
    struct Output {
      @builtin(position) pos: vec4f,
      @location(0) @interpolate(flat) col: vec4f,
    };

    struct Input {
      @builtin(vertex_index) vertexIndex: u32,
    };

    struct Mouse {
      pos: vec2f,
      r: f32,
      g: f32,
      b: f32,
      a: f32,
    };

    @group(0) @binding(0) var<storage, read> mouse: array<Mouse>;

    @vertex fn vs(input: Input) -> Output {
      let pos = mouse[input.vertexIndex];

      let x1: f32 = (pos.pos.x+1 - 160) / 160f;
      let y1: f32 = (pos.pos.y+1 -  90) / -90f;

      var out: Output;
      out.pos = vec4f(x1,y1,0,1);
      out.col = vec4f(pos.r,pos.g,pos.b,pos.a);
      return out;
    }

    @fragment fn fs(input: Output) -> @location(0) vec4f {
      return input.col;
    }
  `,
})

const mousepipeline = device.createRenderPipeline({
  label: 'draw mouse',
  layout: 'auto',
  primitive: { topology: 'point-list' },
  vertex: {
    entryPoint: 'vs',
    module: mousemodule,
  },
  fragment: {
    entryPoint: 'fs',
    module: mousemodule,
    targets: [{
      format: presentationFormat,

      blend: {
        color: {
          operation: 'add',
          srcFactor: 'src-alpha',
          dstFactor: 'one-minus-src-alpha',
        },
        alpha: {
        },
      },

    }],
  },
})

const numpairs = 2

const mouseStorage = device.createBuffer({
  label: 'mouse',
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  size: 4 * 8 * numpairs,
})

const mouseData = new Float32Array(numpairs * 6)

device.queue.writeBuffer(mouseStorage, 0, mouseData)

const mousebindgroup = device.createBindGroup({
  label: 'bindgrup2',
  layout: mousepipeline.getBindGroupLayout(0),
  entries: [
    { binding: 0, resource: { buffer: mouseStorage } },
  ]
})

function drawmouse(pass: GPURenderPassEncoder) {

  pass.setPipeline(mousepipeline)
  pass.setBindGroup(0, mousebindgroup)
  pass.draw(numpairs)


}









canvas.onmousemove = (e) => {
  // console.log(e.offsetX, e.offsetY)

  mouseData[0] = Math.min(320 - 1, e.offsetX)
  mouseData[1] = Math.min(180 - 1, e.offsetY)
  mouseData[2] = 1
  mouseData[3] = 0
  mouseData[4] = 1
  mouseData[5] = 1

  mouseData[6 + 0] = Math.min(320 - 1, e.offsetX) + 2
  mouseData[6 + 1] = Math.min(180 - 1, e.offsetY) + 2
  mouseData[6 + 2] = 1
  mouseData[6 + 3] = 0
  mouseData[6 + 4] = 0
  mouseData[6 + 5] = .5

  device.queue.writeBuffer(mouseStorage, 0, mouseData)
  render()
}












const boxesmodule = device.createShaderModule({
  label: 'boxesmodule',
  code: `
    struct Rect {
      x: i32,
      w: i32,
      y: i32,
      h: i32,
      c: u32,
    };

    struct Output {
      @builtin(position) pos: vec4f,
      @location(0) @interpolate(flat) col: vec4f,
    };

    struct Input {
      @builtin(vertex_index) vertexIndex: u32,
      @builtin(instance_index) instanceIndex: u32,
    };

    @group(0) @binding(0) var<storage, read> rects: array<Rect>;

    @vertex fn vs(input: Input) -> Output {
      let rect = rects[input.instanceIndex];

      let cx1: f32 = f32(rect.x);
      let cx2: f32 = f32(rect.x + rect.w);
      let cy1: f32 = f32(rect.y);
      let cy2: f32 = f32(rect.y + rect.h);
      
      let x0: f32 = (cx1 - 160) / 160f;
      let x1: f32 = (cx1 - 159) / 160f;
      let x2: f32 = (cx2 - 160) / 160f;
      let y1: f32 = (cy1 -  89) / -90f;
      let y2: f32 = (cy2 -  90) / -90f;
      let y3: f32 = (cy2 -  91) / -90f;

      let verts = array(
        vec2f(x0,y1),
        vec2f(x2,y1),

        vec2f(x0,y2),
        vec2f(x2,y2),
        
        vec2f(x2,y1),
        vec2f(x2,y3),
                
        vec2f(x1,y1),
        vec2f(x1,y3),
      );

      let c = rect.c;
      let r = f32((c >> 24) & 0xff) / 255f;
      let g = f32((c >> 16) & 0xff) / 255f;
      let b = f32((c >>  8) & 0xff) / 255f;
      let a = f32(c & 0xff) / 255f;

      var out: Output;
      out.pos = vec4f(verts[input.vertexIndex], 0.0, 1.0);
      out.col = vec4f(r,g,b,a);
      return out;
    }

    @fragment fn fs(input: Output) -> @location(0) vec4f {
      return input.col;
    }
  `,
})

const boxespipeline = device.createRenderPipeline({
  label: 'draw rects',
  layout: 'auto',
  primitive: {
    topology: 'line-list'
  },
  vertex: {
    entryPoint: 'vs',
    module: boxesmodule,
  },
  fragment: {
    entryPoint: 'fs',
    module: boxesmodule,
    targets: [{
      format: presentationFormat,

      blend: {
        color: {
          operation: 'add',
          srcFactor: 'src-alpha',
          dstFactor: 'one-minus-src-alpha',
        },
        alpha: {},
      },

    }],
  },
})


const boxgroups = Array(1).keys().map(() => {

  const numrects = 1000

  const rectsData = new Int32Array(numrects * 5)

  const rectsStorage = device.createBuffer({
    label: 'rects',
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    size: rectsData.length * 4,
  })

  let bindgroup = device.createBindGroup({
    label: 'bindgrup1',
    layout: boxespipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: rectsStorage } },
    ]
  })

  update()

  for (let i = 0; i < numrects; i++) {
    // rectsData[(i * 5) + 0] = 5
    // rectsData[(i * 5) + 1] = 3
    // rectsData[(i * 5) + 2] = 1
    // rectsData[(i * 5) + 3] = 3
    // rectsData[(i * 5) + 4] = 0xff000033
    rectsData[(i * 5) + 0] = randint(0, 320 - 10)
    rectsData[(i * 5) + 1] = randint(1, 320 / 10)
    rectsData[(i * 5) + 2] = randint(0, 180 - 10)
    rectsData[(i * 5) + 3] = randint(1, 180 / 10)
    rectsData[(i * 5) + 4] = randint(0, 0xffffffff)
  }

  device.queue.writeBuffer(rectsStorage, 0, rectsData)

  function update() {

  }

  return { bindgroup, numrects, update }

}).toArray()

function drawboxes(pass: GPURenderPassEncoder) {

  for (const group of boxgroups) {

    // group.update()

    pass.setPipeline(boxespipeline)
    pass.setBindGroup(0, group.bindgroup)
    pass.draw(8, group.numrects)
  }


}



// const tmod = device.createShaderModule({
//   label: 'tmod',
//   code: `
// struct OurVertexShaderOutput {
//   @builtin(position) position: vec4f,
//   @location(0) texcoord: vec2f,
// };

// @vertex fn vs(
//   @builtin(vertex_index) vertexIndex : u32
// ) -> OurVertexShaderOutput {
//   let pos = array(
//     // 1st triangle
//     vec2f( 0.0,  0.0),  // center
//     vec2f( 1.0,  0.0),  // right, center
//     vec2f( 0.0,  1.0),  // center, top

//     // 2nd triangle
//     vec2f( 0.0,  1.0),  // center, top
//     vec2f( 1.0,  0.0),  // right, center
//     vec2f( 1.0,  1.0),  // right, top
//   );

//   var vsOutput: OurVertexShaderOutput;
//   let xy = pos[vertexIndex];
//   vsOutput.position = vec4f(xy, 0.0, 1.0);
//   vsOutput.texcoord = xy;
//   return vsOutput;
// }

// @group(0) @binding(0) var ourSampler: sampler;
// @group(0) @binding(1) var ourTexture: texture_2d<f32>;

// @fragment fn fs(fsInput: OurVertexShaderOutput) -> @location(0) vec4f {
//   return textureSample(ourTexture, ourSampler, fsInput.texcoord);
// }
//   `,
// })



// const pline = device.createRenderPipeline({
//   label: 'pline',
//   layout: 'auto',
//   vertex: {
//     entryPoint: 'vs',
//     module: tmod,
//   },
//   fragment: {
//     entryPoint: 'fs',
//     module: tmod,
//     targets: [{
//       format: presentationFormat,

//       blend: {
//         color: {
//           operation: 'add',
//           srcFactor: 'src-alpha',
//           dstFactor: 'one-minus-src-alpha',
//         },
//         alpha: {},
//       },

//     }],
//   },
// })

// const r = [0xff, 0, 0, 0xff]
// const g = [0, 0xff, 0, 0xff]
// const b = [0, 0, 0xff, 0xff]

// const tdata = new Uint8Array([
//   r, r, g,
//   g, g, b,
//   b, b, r,
// ].flat())


// const texture = device.createTexture({
//   size: [3, 3],
//   format: 'rgba8unorm',
//   usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
// })

// device.queue.writeTexture(
//   { texture },
//   tdata,
//   { bytesPerRow: 3 * 4 },
//   { width: 3, height: 3 },
// )

// const sampler = device.createSampler()

// const tbind = device.createBindGroup({
//   layout: pline.getBindGroupLayout(0),
//   entries: [
//     { binding: 0, resource: sampler },
//     { binding: 1, resource: texture.createView() },
//   ],
// })








// setTimeout(ontick((d) => {

//   console.log(d)
//   render()

// }, 60), 5 * 1000)


function render() {

  const encoder = device.createCommandEncoder({ label: 'encoder' })

  const pass = encoder.beginRenderPass({
    label: 'basic',
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      storeOp: 'store',
    }],
  })

  drawrects(pass)
  // drawboxes(pass)
  // drawpoints(pass)
  // drawmouse(pass)

  // pass.setPipeline(pline)
  // pass.setBindGroup(0, tbind)
  // pass.draw(6)

  pass.end()

  device.queue.submit([(encoder.finish())])
}

render()
