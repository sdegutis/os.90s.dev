import { DrawingContext } from "../api/core/drawing.js"
import { Font } from "../api/core/font.js"
import { $ } from "../api/core/ref.js"
import type { Size } from "../api/core/types.js"
import { debounce } from "../api/util/throttle.js"

export function setupCanvas() {
  const embedded = window.top !== window.self

  const size = getScreenSize(embedded)

  const canvas = document.createElement('canvas')

  canvas.width = size.val.w
  canvas.height = size.val.h

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
    $point.set({ x: Math.round(rect.x), y: Math.round(rect.y) })
  }

  const $scale = $(1)

  function resize() {
    const rect = canvas.parentElement!.getBoundingClientRect()
    let w = size.val.w, h = size.val.h, s = 1
    while (
      (w += size.val.w) <= rect.width &&
      (h += size.val.h) <= rect.height) s++
    canvas.style.transform = `scale(${s})`
    $scale.set(s)
    updatePoint()
  }

  size.watch(s => {
    if (canvas.width === s.w && canvas.height === s.h) return
    canvas.width = s.w
    canvas.height = s.h
    resize()
  })

  new ResizeObserver(resize).observe(canvas.parentElement!)

  const ctx = canvas.getContext('2d')!

  showLoadingScreen(ctx)

  return { size, embedded, ctx, $point, $scale }

}

function getScreenSize(embedded: boolean) {
  if (!embedded) return $({ w: 320, h: 180 })
  const currentSize = (): Size => ({ w: window.innerWidth / 2, h: window.innerHeight / 2 })
  const $size = $(currentSize())
  new ResizeObserver(debounce(() => { $size.set(currentSize()) })).observe(document.body)
  return $size
}

async function showLoadingScreen(ctx: CanvasRenderingContext2D) {
  const fontsrc = await fetch('/os/fs/sys/data/crt34.font').then(r => r.text())
  const font = new Font(fontsrc)

  const w = ctx.canvas.width
  const h = ctx.canvas.height

  const context = new DrawingContext(w, h)

  context.fillRect(0, 0, w, h, 0x333333ff)

  const str = 'loading...'
  const size = font.calcSize(str)

  const px = Math.floor(w / 2 - size.w / 2)
  const py = Math.floor(h / 2 - size.h / 2)

  context.fillRect(px - 3, py - 3, size.w + 6, size.h + 6, 0x333333ff)

  font.print(context, px + 1, py + 1, 0x000000ff, str)
  font.print(context, px, py, 0xffffffff, str)

  const img = context.transferToImageBitmap()

  ctx.drawImage(img, 0, 0)
}
