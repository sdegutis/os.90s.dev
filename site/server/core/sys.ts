import { Cursor } from "../../client/core/cursor.js"
import { DrawingContext } from "../../client/core/drawing.js"
import { Font } from "../../client/core/font.js"
import { Listener } from "../../client/core/listener.js"
import { $, Ref } from "../../client/core/ref.js"
import { Point } from "../../client/core/types.js"
import { fs } from '../../client/fs/fs.js'
import { setupCanvas } from "./canvas.js"
import { Panel } from "./panel.js"
import { Process } from "./process.js"

export class Sys {

  private ctx
  mouse = { x: 0, y: 0 }
  keymap = new Set<string>()

  hovered: Panel | null = null
  focused: Panel | null = null
  clicking: Panel | null = null
  prevFocused: Panel | null = null

  $font
  get font() { return this.$font.val }

  $size
  get size() { return this.$size.val }

  procBegan = new Listener<number>()
  procEnded = new Listener<number>()

  static async init(w: number, h: number) {
    const syncfs = new SharedWorker(import.meta.resolve('./syncfs.js'), { type: 'module' })
    await fs.init(syncfs.port, -1)
    return new Sys(w, h)
  }

  private constructor(width: number, height: number) {
    this.$size = $({ w: width, h: height })

    const fontstr = fs.get('sys/data/crt34.font')!
    this.$font = $(new Font(fontstr))

    const { $point, $scale, canvas, ctx } = setupCanvas(this.$size)
    this.ctx = ctx

    this.showLoadingScreen()

    this.installEventHandlers(canvas, $point, $scale)

    this.launch('sys/apps/shell.js', {})

    if (location.pathname.startsWith('/run/')) {
      const app = location.pathname.slice('/run/'.length)
      console.log(location.pathname)
      this.launch(app, Object.fromEntries(new URLSearchParams(location.search)))
    }
  }

  private installEventHandlers(canvas: HTMLCanvasElement, $point: Ref<Point>, $scale: Ref<number>) {

    document.onkeydown = (e) => {
      if (e.target !== canvas) return
      if (e.key.match(/^F\d{1,2}$/)) return
      e.preventDefault()

      if (e.repeat) return
      this.keymap.add(e.key)
      Process.all.forEach(p => p.rpc.send('keydown', [e.key]))
      this.redrawAllPanels()
    }

    document.onkeyup = (e) => {
      this.keymap.delete(e.key)
      Process.all.forEach(p => p.rpc.send('keyup', [e.key]))
      this.redrawAllPanels()
    }

    document.onmousemove = (e) => {
      let x = e.offsetX
      let y = e.offsetY

      if (e.target !== canvas) {
        x = Math.round((e.offsetX - $point.val.x) / $scale.val)
        y = Math.round((e.offsetY - $point.val.y) / $scale.val)
      }

      if (x === this.mouse.x && y === this.mouse.y) return
      this.mouse.x = x
      this.mouse.y = y

      this.checkUnderMouse()

      const sendto = this.clicking ?? this.hovered
      sendto?.rpc.send('mousemoved', [this.mouse.x, this.mouse.y])

      this.redrawAllPanels()
    }

    document.onmousedown = (e) => {
      if (!this.hovered) return

      if (this.hovered.proc.dead && e.button === 2) {
        this.hovered.proc.terminate()
        return
      }

      this.clicking = this.hovered
      this.focusPanel(this.clicking)

      this.clicking.rpc.send('mousedown', [e.button])
      this.redrawAllPanels()
    }

    document.onmouseup = (e) => {
      this.clicking?.rpc.send('mouseup', [])
      this.clicking = null
      this.redrawAllPanels()
    }

    document.onwheel = (e) => {
      this.hovered?.rpc.send('wheel', [e.deltaX, e.deltaY])
      this.redrawAllPanels()
    }

  }

  async launch(path: string, opts: Record<string, any>) {
    const proc = new Process(this, path, opts)
    await proc.ready.promise
    return proc.id
  }

  resize(w: number, h: number) {
    this.$size.val = { w, h }
    Process.all.forEach(p => p.rpc.send('resized', [w, h]))
    this.redrawAllPanels()
  }

  private findHovered() {
    for (const panel of Panel.ordered.toReversed()) {
      if (this.mouse.x >= panel.x && this.mouse.y >= panel.y &&
        this.mouse.x < panel.x + panel.w &&
        this.mouse.y < panel.y + panel.h
      ) return panel
    }
    return null
  }

  redrawAllPanels() {
    if (Panel.ordered.some(p => p.img)) {
      this.ctx.clearRect(0, 0, this.size.w, this.size.h)
    }
    for (const panel of Panel.ordered) {
      if (panel.img) {
        this.ctx.drawImage(panel.img, panel.x, panel.y)
      }
    }
    this.drawCursor()
  }

  private checkUnderMouse() {
    const newhovered = this.findHovered()
    if (newhovered !== this.hovered) {
      this.hovered?.rpc.send('mouseexited', [])
      this.hovered = newhovered
      this.hovered?.rpc.send('mouseentered', [])
    }
  }

  private drawCursor() {
    cursor.draw(this.ctx, this.mouse.x, this.mouse.y)
  }

  focusPanel(panel: Panel) {
    if (this.focused !== panel) {
      this.prevFocused = this.focused
      this.focused?.rpc.send('blur', [])
      this.focused = panel
      this.focused.rpc.send('focus', [])
    }
    panel.moveToFront()
  }

  removePanel(panel: Panel) {
    if (!Panel.all.delete(panel.id)) return

    const i = Panel.ordered.indexOf(panel)
    Panel.ordered.splice(i, 1)

    if (this.hovered === panel) this.hovered = null
    if (this.clicking === panel) this.clicking = null
    if (this.focused === panel) this.focused = null

    if (this.prevFocused) {
      const prev = this.prevFocused
      this.prevFocused = null
      this.focusPanel(prev)
    }

    this.checkUnderMouse()

    this.redrawAllPanels()
  }

  useCursor(c: Cursor | null) {
    cursor = c ?? defaultCursor
    this.redrawAllPanels()
  }

  private showLoadingScreen() {
    const w = this.ctx.canvas.width
    const h = this.ctx.canvas.height

    const ctx = new DrawingContext(w, h)

    ctx.fillRect(0, 0, w, h, 0x333333ff)

    const str = 'loading...'
    const size = this.font.calcSize(str)

    const px = Math.floor(w / 2 - size.w / 2)
    const py = Math.floor(h / 2 - size.h / 2)

    ctx.fillRect(px - 3, py - 3, size.w + 6, size.h + 6, 0x333333ff)

    this.font.print(ctx, px + 1, py + 1, 0x000000ff, str)
    this.font.print(ctx, px, py, 0xffffffff, str)

    const img = ctx.canvas.transferToImageBitmap()

    this.ctx.drawImage(img, 0, 0)
  }

}

const defaultCursor = Cursor.fromString(`
offx=1
offy=1
colors[]=0x000000ff
colors[]=0xffffffff
pixels=

1 1 1 1
1 2 2 1
1 2 1 1
1 1 1 0
`.trimStart())

let cursor = defaultCursor
