export function setupCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 180
  canvas.style.imageRendering = 'pixelated'
  canvas.style.backgroundColor = '#000'
  canvas.style.outline = 'none'
  canvas.style.cursor = 'none'
  document.body.replaceChildren(canvas)
  new ResizeObserver(() => {
    const rect = canvas.parentElement!.getBoundingClientRect()
    let w = 320, h = 180, s = 1
    while ((w += 320) <= rect.width && (h += 180) <= rect.height) s++
    canvas.style.transform = `scale(${s})`
  }).observe(canvas.parentElement!)
  const ctx = canvas.getContext('2d')!
  return { ctx, canvas }
}
