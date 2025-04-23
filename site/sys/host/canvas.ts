import { $, Ref } from "../api/core/ref.js"
import type { Size } from "../api/core/types.js"

export function setupCanvas(size: Ref<Size>) {

  const canvas = document.createElement('canvas')

  canvas.width = size.$.w
  canvas.height = size.$.h

  canvas.style.imageRendering = 'pixelated'
  canvas.style.backgroundColor = '#000'
  canvas.style.outline = 'none'
  canvas.style.cursor = 'none'

  canvas.oncontextmenu = (e) => {
    if (e.target === canvas) e.preventDefault()
  }

  document.body.replaceChildren(canvas)

  canvas.tabIndex = 1

  const $point = $({ x: 0, y: 0 })
  const updatePoint = () => {
    const rect = canvas.getBoundingClientRect()
    $point.$ = { x: Math.round(rect.x), y: Math.round(rect.y) }
  }

  const $scale = $(1)

  function resize() {
    const rect = canvas.parentElement!.getBoundingClientRect()
    let w = size.$.w, h = size.$.h, s = 1
    while (
      (w += size.$.w) <= rect.width &&
      (h += size.$.h) <= rect.height) s++
    canvas.style.transform = `scale(${s})`
    $scale.$ = s
    updatePoint()
  }

  size.watch(s => {
    canvas.width = s.w
    canvas.height = s.h
    resize()
  })

  new ResizeObserver(resize).observe(canvas.parentElement!)

  const ctx = canvas.getContext('2d')!
  return { ctx, $point, $scale }

}
