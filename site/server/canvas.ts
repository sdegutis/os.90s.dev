import type { Ref } from "../shared/ref.js"

export function setupCanvas(size: Ref<{ readonly w: number, readonly h: number }>) {

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

  function resize() {
    const rect = canvas.parentElement!.getBoundingClientRect()
    let w = size.val.w, h = size.val.h, s = 1
    while (
      (w += size.val.w) <= rect.width &&
      (h += size.val.h) <= rect.height) s++
    canvas.style.transform = `scale(${s})`
  }

  size.watch(s => {
    canvas.width = s.w
    canvas.height = s.h
    resize()
  })

  new ResizeObserver(resize).observe(canvas.parentElement!)

  const ctx = canvas.getContext('2d')!
  return { ctx, canvas }

}
