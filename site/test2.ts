
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

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
in vec2 a_texCoord;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// Used to pass the texture coordinates to the fragment shader
out vec2 v_texCoord;

// all shaders have a main function
void main() {

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  // pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points.
  v_texCoord = a_texCoord;
}
`

const frag = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = texture(u_image, v_texCoord);
}
`

const prog = createProg(vert, frag)
const program = prog




var texture = gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D, texture)
const data = new Uint8Array([
  255, 0, 0, 255,
  255, 0, 255, 255,
  255, 255, 0, 255,
  255, 0, 255, 255,
  255, 255, 0, 255,
  255, 0, 255, 255,
  255, 0, 255, 255,
  255, 255, 0, 255,
])
// const data2 = new arraybuffervi
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 4, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)







// look up where the vertex data needs to go.
var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
var texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord")

// lookup uniforms
var resolutionLocation = gl.getUniformLocation(program, "u_resolution")
var imageLocation = gl.getUniformLocation(program, "u_image")

// Create a vertex array object (attribute state)
var vao = gl.createVertexArray()

// and make it the one we're currently working with
gl.bindVertexArray(vao)




// Turn on the attribute
gl.enableVertexAttribArray(positionAttributeLocation)

// Create a buffer and put a single pixel space rectangle in
// it (2 triangles)
var positionBuffer = gl.createBuffer()

// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
var size = 2          // 2 components per iteration
var type = gl.FLOAT   // the data is 32bit floats
var normalize = false // don't normalize the data
var stride = 0        // 0 = move forward size * sizeof(type) each iteration to get the next position
var offset = 0        // start at the beginning of the buffer
gl.vertexAttribPointer(
  positionAttributeLocation, size, type, normalize, stride, offset)





// Turn on the attribute
gl.enableVertexAttribArray(texCoordAttributeLocation)

// provide texture coordinates for the rectangle.
var texCoordBuffer = gl.createBuffer()

gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)

// Tell the attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
var size = 2          // 2 components per iteration
var type = gl.FLOAT   // the data is 32bit floats
var normalize = false // don't normalize the data
var stride = 0        // 0 = move forward size * sizeof(type) each iteration to get the next position
var offset = 0        // start at the beginning of the buffer
gl.vertexAttribPointer(
  texCoordAttributeLocation, size, type, normalize, stride, offset)

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  0.0, 0.0,
  1.0, 0.0,
  0.0, 1.0,
  0.0, 1.0,
  1.0, 0.0,
  1.0, 1.0,
]), gl.STATIC_DRAW)








// make unit 0 the active texture uint
// (ie, the unit all other texture commands will affect
gl.activeTexture(gl.TEXTURE0 + 0)

// Bind it to texture unit 0' 2D bind point
gl.bindTexture(gl.TEXTURE_2D, texture)

// Set the parameters so we don't need mips and so we're not filtering
// and we don't repeat at the edges
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

// Upload the image into the texture.
var internalFormat = gl.RGBA   // format we want in the texture
var srcFormat = gl.RGBA        // format of data we are supplying
var srcType = gl.UNSIGNED_BYTE // type of data we are supplying
gl.texImage2D(gl.TEXTURE_2D,
  0 // the largest mip
  ,
  internalFormat,
  2,
  4,
  0,
  srcFormat,
  srcType,
  data)










// Tell WebGL how to convert from clip space to pixels
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

// Clear the canvas
gl.clearColor(0, 0, 0, 0)
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

// Tell it to use our program (pair of shaders)
gl.useProgram(program)

// Bind the attribute/buffer set we want.
gl.bindVertexArray(vao)

// Pass in the canvas resolution so we can convert from
// pixels to clipspace in the shader
gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)

// Tell the shader to get the texture from texture unit 0
gl.uniform1i(imageLocation, 0)

// Bind the position buffer so gl.bufferData that will be called
// in setRectangle puts data in the position buffer
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

// Set a rectangle the same size as the image.
var x1 = 100
var x2 = 100 + 20
var y1 = 100
var y2 = 100 + 40
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  x1, y1,
  x2, y1,
  x1, y2,
  x1, y2,
  x2, y1,
  x2, y2,
]), gl.STATIC_DRAW)

// Draw the rectangle.
gl.drawArrays(gl.TRIANGLES, 0, 6)










canvas.onmousemove = (e) => {
  const x = Math.min(e.offsetX, 320 - 1)
  const y = Math.min(e.offsetY, 180 - 1)

  const data2 = new Uint8Array([
    x, y, 0, 255,
  ])


  gl.texSubImage2D(gl.TEXTURE_2D, 0, 1, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data2)


  // Draw the rectangle.
  gl.drawArrays(gl.TRIANGLES, 0, 6)


  // gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  //   x, y,
  //   x + 2, y + 1,
  // ]), gl.STATIC_DRAW)
  // gl.drawArrays(gl.POINTS, 0, 2)


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
