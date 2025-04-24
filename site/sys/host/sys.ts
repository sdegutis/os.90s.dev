import { BC, KeyEvent, PanelEvent, ProcEvent, SysEvent } from "../api/core/bc.js"
import { sysConfig } from "../api/core/config.js"
import { Cursor } from "../api/core/cursor.js"
import { DrawingContext } from "../api/core/drawing.js"
import { runJsFile } from "../api/core/open.js"
import { defRef, MaybeRef, Ref } from "../api/core/ref.js"
import { Point, Size, sizeEquals } from "../api/core/types.js"
import { debounce } from "../api/util/throttle.js"
import { setupCanvas } from "./canvas.js"
import { Panel } from "./panel.js"
import { Process } from "./process.js"


export class Sys {

  id = crypto.randomUUID()
  private ctx
  mouse = { x: 0, y: 0 }
  keymap = new Set<string>()

  hovered: Panel | null = null
  focused: Panel | null = null
  clicking: Panel | null = null
  prevFocused: Panel | null = null

  sysevents = new BC<SysEvent>('sysevents', this.id)
  keyevents = new BC<KeyEvent>('keyevents', this.id)
  panelevents = new BC<PanelEvent>('panelevents', this.id)

  $font
  get font() { return this.$font.$ }

  $size
  get size() { return this.$size.$ }

  desktop: Point & Size

  #initialAppsLoaded = false

  loading = 0

  constructor(canvas: ReturnType<typeof setupCanvas>, size: MaybeRef<Size>) {
    const { $point, $scale, ctx } = canvas
    this.ctx = ctx

    this.$font = sysConfig.$font

    this.showLoadingScreen()

    this.$size = defRef(size)
    this.$size.equals = sizeEquals

    this.$size.watch(size => {
      this.resize(size.w, size.h)
    })

    this.desktop = { x: 0, y: 0, ...this.size }

    this.installEventHandlers($point, $scale)

    new BC<ProcEvent>('procevents', this.id).handle(() => {
      this.updateLocation()
    })
  }

  async runShell() {
    await this.launch(sysConfig.$shell.$, {}, [])
    sysConfig.$shell.watch(shell => {
      this.launch(shell, {}, [])
    })
  }

  async runStartupApps() {
    for (const path of sysConfig.startup ?? []) {
      runJsFile(path)
    }
  }

  focus() {
    this.ctx.canvas.focus()
  }

  async loadAppsFromUrl() {
    type RunApp = { path: string, params: Record<string, string> }
    const runApps: RunApp[] = location.hash.slice(1).split(';').map((app) => {
      const [path, file] = app.split('@')
      return { path, params: { file } }
    })

    const launches = runApps.map(app => this.launch(app.path, app.params, []))
    await Promise.all(launches)

    this.#initialAppsLoaded = true
  }

  private installEventHandlers($point: Ref<Point>, $scale: Ref<number>) {
    const canvas = this.ctx.canvas

    window.onblur = (e) => {
      const keys = [...this.keymap.values()]
      this.keymap.clear()

      for (const key of keys) {
        this.keyevents.emit({ type: 'keyup', key })
      }
    }

    document.onkeydown = (e) => {
      if (e.target !== canvas) return
      if (e.key.match(/^F\d{1,2}$/)) return
      e.preventDefault()

      if (e.repeat) return
      this.keymap.add(e.key)
      this.keyevents.emit({ type: 'keydown', key: e.key })
      this.redrawAllPanels()
    }

    document.onkeyup = (e) => {
      const wasDown = this.keymap.delete(e.key)
      if (!wasDown) return

      this.keyevents.emit({ type: 'keyup', key: e.key })
      this.redrawAllPanels()
    }

    document.onmousemove = (e) => {
      let x = e.offsetX
      let y = e.offsetY

      if (e.target !== canvas) {
        x = Math.round((e.offsetX - $point.$.x) / $scale.$)
        y = Math.round((e.offsetY - $point.$.y) / $scale.$)
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

      if (this.hovered.proc.status === 'zombie' && e.button === 2) {
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

  async launch(path: string, opts: Record<string, any>, optsTs: Transferable[]) {
    const proc = new Process(this, path, opts, optsTs)
    this.loading++
    try { await proc.ready.promise }
    catch { return null }
    finally {
      this.loading--
    }
    return proc.id
  }

  resize(w: number, h: number) {
    this.$size.$ = { w, h }
    this.sysevents.emit({ type: 'resized', size: [w, h] })
    this.redrawAllPanels()
  }

  private findHovered() {
    for (const panel of Panel.ordered.toReversed()) {
      if (!panel.visible) continue
      if (this.mouse.x >= panel.x && this.mouse.y >= panel.y &&
        this.mouse.x < panel.x + panel.w &&
        this.mouse.y < panel.y + panel.h
      ) return panel
    }
    return null
  }

  redrawAllPanels() {
    for (const panel of Panel.ordered) {
      if (panel.proc.status === 'dead') continue
      if (!panel.visible) continue
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
    const c = this.loading ? loadingCursor : cursor
    c.draw(this.ctx, this.mouse.x, this.mouse.y)
  }

  focusPanel(panel: Panel) {
    if (this.focused !== panel) {
      this.prevFocused = this.focused
      this.focused?.rpc.send('blur', [])
      this.focused = panel
      this.focused.visible = true
      this.panelevents.emit({ type: 'focused', id: panel.id })
      this.focused.rpc.send('focus', [])
      this.updateLocation()
    }
    panel.moveToFront()
  }

  updateLocation = debounce(() => this.#updateLocation(), 33)
  #updateLocation() {
    if (!this.#initialAppsLoaded) return

    const apps = Panel.ordered
      .values()
      .filter(p => p.visible)
      .map(p => p.proc)
      .filter(p => !p.path.endsWith('/shell.app.js'))
      .toArray()

    let url = apps.map(app => {
      let file = ''
      if (app.file) file = `@${app.file}`
      return `${app.path}${file}`
    }).join(';')

    history.replaceState({}, '', url ? `/#${url}` : `/`)
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

    this.updateLocation()
    this.redrawAllPanels()
  }

  useCursor(c: Cursor | null) {
    cursor = c ?? defaultCursor
    this.redrawAllPanels()
  }

  setDesktop(x: number, y: number, w: number, h: number) {
    this.desktop = { x, y, w, h }
    this.sysevents.emit({ type: 'desktop', desktop: { x, y, w, h } })
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

    const img = ctx.transferToImageBitmap()

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

const loadingCursor = Cursor.fromString(`
offx=1
offy=1
colors[]=0x000000ff
colors[]=0xffffffff
pixels=

1 1 1 1 0 0
1 2 2 1 0 0
1 2 1 1 0 0
1 1 1 0 1 0
0 0 0 1 2 1
0 0 0 0 1 0
`.trimStart())

let cursor = defaultCursor
