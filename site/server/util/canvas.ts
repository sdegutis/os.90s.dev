import { $, Ref } from "../../client/core/ref.js"
import { Size } from "/shared/types.js"

export function setupCanvas(size: Ref<Size>) {

  const canvas = document.createElement('canvas')

  canvas.width = size.val.w
  canvas.height = size.val.h

  canvas.style.imageRendering = 'pixelated'
  canvas.style.backgroundColor = '#000'
  canvas.style.outline = 'none'
  canvas.style.cursor = 'none'

  document.body.replaceChildren(canvas)

  canvas.tabIndex = 1
  canvas.focus()

  const $point = $({ x: 0, y: 0 })
  const updatePoint = () => {
    const rect = canvas.getBoundingClientRect()
    $point.val = { x: Math.round(rect.x), y: Math.round(rect.y) }
  }

  const $scale = $(1)

  function resize() {
    const rect = canvas.parentElement!.getBoundingClientRect()
    let w = size.val.w, h = size.val.h, s = 1
    while (
      (w += size.val.w) <= rect.width &&
      (h += size.val.h) <= rect.height) s++
    canvas.style.transform = `scale(${s})`
    $scale.val = s
    updatePoint()
  }

  size.watch(s => {
    canvas.width = s.w
    canvas.height = s.h
    resize()
  })

  new ResizeObserver(resize).observe(canvas.parentElement!)

  const ctx = canvas.getContext('2d')!
  return { ctx, canvas, $point, $scale }

}
