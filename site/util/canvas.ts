export function setupCanvas(width: number, height: number) {

  const canvas = document.createElement('canvas')

  canvas.width = width
  canvas.height = height

  canvas.style.imageRendering = 'pixelated'
  canvas.style.backgroundColor = '#000'
  canvas.style.outline = 'none'
  canvas.style.cursor = 'none'

  document.body.replaceChildren(canvas)

  canvas.tabIndex = 1
  canvas.focus()

  new ResizeObserver(() => {
    const rect = canvas.parentElement!.getBoundingClientRect()
    let w = width, h = height, s = 1
    while (
      (w += width) <= rect.width &&
      (h += height) <= rect.height) s++
    canvas.style.transform = `scale(${s})`
  }).observe(canvas.parentElement!)

  const ctx = canvas.getContext('2d')!
  return { ctx, canvas }

}
