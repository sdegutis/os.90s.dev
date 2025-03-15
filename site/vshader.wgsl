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
