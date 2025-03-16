const GRID_W = 320
const GRID_H = 180


const shader = `
struct VertexInput {
  @location(0) pos: vec2f,
  @builtin(instance_index) instance: u32,
};

struct VertexOutput {
  @builtin(position) pos: vec4f,
  @location(0) cell: vec2f,
};

@group(0) @binding(0) var<uniform> grid: vec2f;
@group(0) @binding(1) var<storage> cellState: array<u32>;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput  {
  let i = f32(input.instance);
  let cell = vec2f(i % grid.x, floor(i / grid.x));
  let state = f32(cellState[input.instance]);

  let cellOffset = cell / grid * 2;
  let gridPos = (input.pos + 1) / grid - 1 + cellOffset;
  
  var output: VertexOutput;
  output.pos = vec4f(gridPos, 0, 1);
  output.cell = cell;
  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {

  let i = u32(input.cell.x + grid.x * input.cell.y);
  let c = cellState[i];

  let r = f32((c >> 24) & 0xff) / 0xff;
  let g = f32((c >> 16) & 0xff) / 0xff;
  let b = f32((c >> 8) & 0xff) / 0xff;
  let a = f32(c & 0xff) / 0xff;

  if (c == 0) {
    discard;
  }

  return vec4f(r,g,b,a);
}
`


const canvas = document.createElement("canvas")
document.body.append(canvas)

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

// Canvas configuration
const context = canvas.getContext('webgpu')!
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
  code: shader
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

  console.log('here')
}

render()
setInterval(render, 1000)
