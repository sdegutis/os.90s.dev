
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


const gl = canvas.getContext('webgl2')!

function createShader(src: string, type: GLenum) {
  const shader = gl.createShader(type)!

  gl.shaderSource(shader, src)
  gl.compileShader(shader)

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!success) {
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    throw Error()
  }

  return shader
}

function createProg(vert: string, frag: string) {
  const vertShader = createShader(vert, gl.VERTEX_SHADER)
  const fragShader = createShader(frag, gl.FRAGMENT_SHADER)

  const prog = gl.createProgram()
  gl.attachShader(prog, vertShader)
  gl.attachShader(prog, fragShader)
  gl.linkProgram(prog)

  const success = gl.getProgramParameter(prog, gl.LINK_STATUS)
  if (!success) {
    console.error(gl.getProgramInfoLog(prog))
    gl.deleteProgram(prog)
    throw Error()
  }

  return prog
}



new EventSource('/_reload').onmessage = () => location.reload()





const vert = `#version 300 es
in vec2 a_position;
uniform vec2 res;

void main() {
  gl_Position = vec4((((a_position+0.5)/res*2.0)-1.0)*vec2(1,-1), 0, 1);
  gl_PointSize = 1.0;
}
`

const frag = `#version 300 es
precision highp float;

out vec4 color;

void main() {
  color = vec4(0,.3,0,1);
}
`

const prog = createProg(vert, frag)

const resUniLoc = gl.getUniformLocation(prog, 'res')
const posAttrLoc = gl.getAttribLocation(prog, 'a_position')

const posBuf = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  319, 179,
  0, 3,
]), gl.STATIC_DRAW)

const vao = gl.createVertexArray()
gl.bindVertexArray(vao)

gl.enableVertexAttribArray(posAttrLoc)
gl.vertexAttribPointer(posAttrLoc, 2, gl.FLOAT, false, 0, 0)

gl.viewport(0, 0, 320, 180)

gl.clearColor(0, 0, 0, 0)
gl.clear(gl.COLOR_BUFFER_BIT)

gl.useProgram(prog)

gl.uniform2f(resUniLoc, 320, 180)

gl.bindVertexArray(vao)

gl.drawArrays(gl.POINTS, 0, 2)


canvas.onmousemove = (e) => {
  const x = Math.min(e.offsetX, 320 - 1)
  const y = Math.min(e.offsetY, 180 - 1)


  // gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x, y,
    x + 2, y + 1,
  ]), gl.STATIC_DRAW)
  gl.drawArrays(gl.POINTS, 0, 2)


}



// const vert = `#version 300 es
// in vec2 a_position;
// uniform vec2 u_resolution;

// void main() {
//   vec2 zeroToOne = a_position / u_resolution;
//   vec2 zeroToTwo = zeroToOne * 2.0;
//   vec2 clipSpace = zeroToTwo - 1.0;
//   gl_Position = vec4(clipSpace * vec2(1,-1), 0, 1);
//   //gl_Position = a_position;
// }
// `

// const frag = `#version 300 es
// precision highp float;
// uniform vec4 u_color;
// out vec4 outColor;

// void main() {
//   outColor = u_color;
// }
// `

// const prog = createProg(vert, frag)


// const resUniLoc = gl.getUniformLocation(prog, 'u_resolution')
// const colLoc = gl.getUniformLocation(prog, 'u_color')
// const posAttrLoc = gl.getAttribLocation(prog, 'a_position')

// const posBuf = gl.createBuffer()
// gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)

// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
//   10, 20,
//   80, 20,
//   10, 30,
//   10, 30,
//   80, 20,
//   80, 30,
// ]), gl.STATIC_DRAW)

// const vao = gl.createVertexArray()
// gl.bindVertexArray(vao)

// gl.enableVertexAttribArray(posAttrLoc)
// gl.vertexAttribPointer(posAttrLoc, 2, gl.FLOAT, false, 0, 0)

// gl.viewport(0, 0, 320, 180)

// gl.clearColor(0, 0, 0, 0)
// gl.clear(gl.COLOR_BUFFER_BIT)

// gl.useProgram(prog)

// gl.uniform2f(resUniLoc, 320, 180)
// gl.uniform4f(colLoc, 0, 0.7, 0, 1)

// gl.bindVertexArray(vao)

// gl.drawArrays(gl.TRIANGLES, 0, 6)
