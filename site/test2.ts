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
const context = canvas.getContext('2d')!


context.fillStyle = '#ff0000ff'
context.fillRect(94, 42, 5, 10)

context.fillStyle = '#00ff0055'
context.fillRect(97, 42, 15, 20)
