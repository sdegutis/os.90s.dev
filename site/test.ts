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
context.configure({ device, format: presentationFormat })







const module = device.createShaderModule({
  label: 'test shaders',
  code: `
    struct Rect {
      x1: i32,
      x2: i32,
      y1: i32,
      y2: i32,
      c: i32,
    };

    struct Output {
      @builtin(position) pos: vec4f,
      @location(0) @interpolate(flat) col: vec4f,
    };

    // struct Input {
    //   @builtin(vertex_index) vertexIndex: u32,

    // };

    // @group(0) @binding(0) var<storage, read> r: Rect;

    @vertex fn vs(
      @builtin(vertex_index) vertexIndex : u32
    ) -> Output {
      let cx1: f32 = 94;
      let cx2: f32 = 99;
      let cy1: f32 = 42;
      let cy2: f32 = 49;
      
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
      out.pos = vec4f(verts[vertexIndex], 0.0, 1.0);
      out.col = vec4f(0.0, 1.0, 0.0, 1.0);
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
    targets: [{ format: presentationFormat }],
  },
})




const array = new Int32Array(5)

array[0] = 94
array[1] = 99
array[2] = 42
array[3] = 49
array[4] = 0xff0000ff

const storage = device.createBuffer({
  label: 'rects',
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  size: array.length * 4,
})

device.queue.writeBuffer(storage, 0, array)



// const bindgroup = device.createBindGroup({
//   label: 'bindgrup1',
//   layout: pipeline.getBindGroupLayout(0),
//   entries: [
//     { binding: 0, resource: { buffer: storage } },
//   ]
// })




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
  // pass.setBindGroup(0, bindgroup)
  pass.draw(6)
  pass.end()

  device.queue.submit([(encoder.finish())])
}

render()
