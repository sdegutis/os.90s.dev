@vertex
fn vmain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
  return vec4f(pos, 0, 1);
}

@fragment
fn fmain() -> @location(0) vec4f {
  return vec4f(.3, 0, 0, 1);
}
