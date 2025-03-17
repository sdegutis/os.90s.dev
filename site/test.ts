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







const module = device.createShaderModule({
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

const module2 = device.createShaderModule({
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

const pipeline = device.createRenderPipeline({
  label: 'draw rects',
  layout: 'auto',
  vertex: {
    entryPoint: 'vs',
    module,
  },
  fragment: {
    entryPoint: 'fs',
    module,
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

const pipeline2 = device.createRenderPipeline({
  label: 'draw rects',
  layout: 'auto',
  vertex: {
    entryPoint: 'vs',
    module: module2,
  },
  fragment: {
    entryPoint: 'fs',
    module: module2,
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



const rectsData = new Int32Array(10)

rectsData[0] = 94
rectsData[1] = 5
rectsData[2] = 42
rectsData[3] = 10
rectsData[4] = 0xff0000ff

rectsData[5 + 0] = 97
rectsData[5 + 1] = 15
rectsData[5 + 2] = 42
rectsData[5 + 3] = 20
rectsData[5 + 4] = 0x00ff0055

const rectsStorage = device.createBuffer({
  label: 'rects',
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  size: rectsData.length * 4,
})

device.queue.writeBuffer(rectsStorage, 0, rectsData)


const mouseStorage = device.createBuffer({
  label: 'mouse',
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  size: 4 * 2,
})

const mouseData = new Int32Array(2)

device.queue.writeBuffer(mouseStorage, 0, mouseData)




let bindgroup = device.createBindGroup({
  label: 'bindgrup1',
  layout: pipeline.getBindGroupLayout(0),
  entries: [
    { binding: 0, resource: { buffer: rectsStorage } },
  ]
})

const bindgroup2 = device.createBindGroup({
  label: 'bindgrup2',
  layout: pipeline2.getBindGroupLayout(0),
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

let i = 0

const timer = setInterval(() => {


  const array = new Int32Array(10)

  array[0] = 94 + i++
  array[1] = 5
  array[2] = 42
  array[3] = 10
  array[4] = 0xff0000ff

  array[5 + 0] = 97
  array[5 + 1] = 15
  array[5 + 2] = 42
  array[5 + 3] = 20
  array[5 + 4] = 0x00ff0055

  const storage = device.createBuffer({
    label: 'rects',
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    size: array.length * 4,
  })

  device.queue.writeBuffer(storage, 0, array)



  bindgroup = device.createBindGroup({
    label: 'bindgrup1',
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: storage } },
    ]
  })

  render()

}, 300)

setTimeout(() => clearInterval(timer), 10_000)



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

  pass.setPipeline(pipeline)
  pass.setBindGroup(0, bindgroup)
  pass.draw(6, 2)


  pass.setPipeline(pipeline2)
  pass.setBindGroup(0, bindgroup2)
  pass.draw(6)

  pass.end()

  device.queue.submit([(encoder.finish())])
}

render()
