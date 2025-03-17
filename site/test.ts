import { ontick } from "./client/util/ontick.js"

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
  label: 'test shaders',
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
      let y1: f32 = (cy1 - 90) / -90f;
      let y2: f32 = (cy2 - 90) / -90f;

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
      let b = f32((c >> 8) & 0xff) / 255f;
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

const mousemodule = device.createShaderModule({
  label: 'module2',
  code: `
    struct Output {
      @builtin(position) pos: vec4f,
      @location(0) @interpolate(flat) col: vec4f,
    };

    struct Input {
      @builtin(vertex_index) vertexIndex: u32,
    };

    @group(0) @binding(0) var<uniform> mouse: vec2i;

    @vertex fn vs(input: Input) -> Output {
      let rect = mouse;

      let cx1: f32 = f32(rect.x);
      let cx2: f32 = f32(rect.x + 1);
      let cy1: f32 = f32(rect.y);
      let cy2: f32 = f32(rect.y + 1);
      
      let x1: f32 = (cx1 - 160) / 160f;
      let x2: f32 = (cx2 - 160) / 160f;
      let y1: f32 = (cy1 - 90) / -90f;
      let y2: f32 = (cy2 - 90) / -90f;

      let verts = array(
        vec2f(x1,y1),
        vec2f(x2,y1),
        vec2f(x1,y2),
        vec2f(x1,y2),
        vec2f(x2,y2),
        vec2f(x2,y1),
      );

      var out: Output;
      out.pos = vec4f(verts[input.vertexIndex], 0.0, 1.0);
      out.col = vec4f(1,1,1,.5);
      return out;
    }

    @fragment fn fs(input: Output) -> @location(0) vec4f {
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

const rectgroups = Array(1).keys().map(() => {

  const numrects = 60000

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

  for (let i = 0; i < numrects; i++) {
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

function drawrects(pass: GPURenderPassEncoder) {

  for (const group of rectgroups) {

    // group.update()

    pass.setPipeline(rectspipeline)
    pass.setBindGroup(0, group.bindgroup)
    pass.draw(6, group.numrects)
  }


}







const mousepipeline = device.createRenderPipeline({
  label: 'draw rects',
  layout: 'auto',
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

const mouseStorage = device.createBuffer({
  label: 'mouse',
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  size: 4 * 2,
})

const mouseData = new Int32Array(2)

device.queue.writeBuffer(mouseStorage, 0, mouseData)

const mousebindgroup = device.createBindGroup({
  label: 'bindgrup2',
  layout: mousepipeline.getBindGroupLayout(0),
  entries: [
    { binding: 0, resource: { buffer: mouseStorage } },
  ]
})










canvas.onmousemove = (e) => {
  // console.log(e.offsetX, e.offsetY)

  mouseData[0] = Math.min(320 - 1, e.offsetX)
  mouseData[1] = Math.min(180 - 1, e.offsetY)
  device.queue.writeBuffer(mouseStorage, 0, mouseData)
  render()
}





setTimeout(ontick((d) => {

  console.log(d)
  render()

}, 60), 5 * 1000)


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

  pass.setPipeline(mousepipeline)
  pass.setBindGroup(0, mousebindgroup)
  pass.draw(6)

  pass.end()

  device.queue.submit([(encoder.finish())])
}

render()
