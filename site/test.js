const GRID_SIZE = 32;

const canvas = document.querySelector("canvas");

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

// Canvas configuration
const context = canvas.getContext("webgpu");
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
  device: device,
  format: canvasFormat,
});

const vertices = new Float32Array([

  -0.8, -0.8,
  0.8, -0.8,
  0.8, 0.8,

  0.8, 0.8,
  -0.8, 0.8,
  -0.8, -0.8,

]);

const vertexBuffer = device.createBuffer({
  label: "Cell vertices",
  size: vertices.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(vertexBuffer, 0, vertices);

const vertexBufferLayout = {
  arrayStride: 8,
  attributes: [{
    format: "float32x2",
    offset: 0,
    shaderLocation: 0, // Position, see vertex shader
  }],
};

const cellShaderModule = device.createShaderModule({
  label: "Cell shader",
  code: await fetch('./vshader.wgsl').then(r => r.text())
});


const cellPipeline = device.createRenderPipeline({
  label: "Cell pipeline",
  layout: "auto",
  vertex: {
    module: cellShaderModule,
    entryPoint: "vmain",
    buffers: [vertexBufferLayout]
  },
  fragment: {
    module: cellShaderModule,
    entryPoint: "fmain",
    targets: [{
      format: canvasFormat
    }]
  }
});





// Clear the canvas with a render pass
const encoder = device.createCommandEncoder();

const pass = encoder.beginRenderPass({
  colorAttachments: [{
    view: context.getCurrentTexture().createView(),
    loadOp: "clear",
    clearValue: { r: 0, g: 0, b: 0.4, a: 1 },
    storeOp: "store",
  }]
});

pass.setPipeline(cellPipeline);
pass.setVertexBuffer(0, vertexBuffer);
pass.draw(vertices.length / 2); // 6 vertices

pass.end();


device.queue.submit([(encoder.finish())]);
