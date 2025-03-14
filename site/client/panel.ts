import { Listener } from "../shared/listener.js"
import { wRPC, type ClientPanel, type KeyMap, type ServerPanel } from "../shared/rpc.js"
import { Rect } from "./rect.js"

type MousePos = { x: number, y: number }

export class Panel extends Rect {

  static all = new Map<number, Panel>()

  id
  rpc

  absmouse: MousePos = { x: 0, y: 0 }
  mouse: MousePos = { x: 0, y: 0 }
  keymap: KeyMap = Object.create(null)

  down?: () => void

  didClose = new Listener()

  constructor(port: MessagePort, id: number, x: number, y: number, w: number, h: number) {
    super()

    Panel.all.set(id, this)

    this.id = id
    this._x = x
    this._y = y
    this._w = w
    this._h = h

    this.rpc = wRPC<ClientPanel, ServerPanel>(port)

    this.rpc.listen('focus', (keymap) => {
      this.keymap = keymap
    })

    this.rpc.listen('blur', () => {

    })

    this.rpc.listen('mouseentered', () => {

    })

    this.rpc.listen('mouseexited', () => {

    })

    this.rpc.listen('mousedown', (b) => {
      this.down = dragMove(this.absmouse, this)
    })

    this.rpc.listen('mousemoved', (x, y) => {
      this.absmouse.x = x
      this.absmouse.y = y
      this.fixMouse()
      this.down?.()
    })

    this.rpc.listen('mouseup', () => {
      delete this.down
    })

    this.rpc.listen('wheel', (n) => {

    })

    this.rpc.listen('keydown', (key) => {
      this.keymap[key] = true
    })

    this.rpc.listen('keyup', (key) => {
      delete this.keymap[key]
    })

  }

  override move(x: number, y: number) {
    this.x = x
    this.y = y
    this.fixMouse()
    this.rpc.send('adjust', [this.x, this.y, this.w, this.h])
  }

  override resize(w: number, h: number) {
    this.w = w
    this.h = h
    this.rpc.send('adjust', [this.x, this.y, this.w, this.h])
    this.blit()
  }

  blit() {
    const canvas = new OffscreenCanvas(this.w, this.h)
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = ({
      '/apps/desktop.js': '#333',
      '/apps/prog1.js': '#300c',
      '/apps/prog2.js': '#030c',
      '/apps/prog3.js': '#003c',
    })[location.pathname]!

    ctx.fillRect(0, 0, this.w, this.h)
    const bmp = canvas.transferToImageBitmap()
    this.rpc.send('blit', [bmp], [bmp])
  }

  close() {
    this.rpc.send('close', [])
    this.didClose.dispatch()
  }

  private fixMouse() {
    this.mouse.x = this.absmouse.x - this.x
    this.mouse.y = this.absmouse.y - this.y
  }

}

export function dragMove(m: MousePos, o: { x: number, y: number }) {
  const startPos = { x: o.x, y: o.y }
  const offx = m.x - startPos.x
  const offy = m.y - startPos.y
  return () => {
    const diffx = m.x - startPos.x
    const diffy = m.y - startPos.y
    o.x = startPos.x + diffx - offx
    o.y = startPos.y + diffy - offy
    return { x: diffx - offx, y: diffy - offy }
  }
}
