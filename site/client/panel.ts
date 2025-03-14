import { wRPC, type ClientPanel, type ServerPanel } from "../shared/rpc.js"
import { Rect } from "./rect.js"

type MousePos = { x: number, y: number }

export class Panel extends Rect {

  static map = new Map<number, Panel>()

  id

  absmouse: MousePos = { x: 0, y: 0 }
  mouse: MousePos = { x: 0, y: 0 }
  down?: () => void

  rpc

  constructor(port: MessagePort, id: number, x: number, y: number, w: number, h: number) {
    super()

    Panel.map.set(id, this)

    this.id = id
    this._x = x
    this._y = y
    this._w = w
    this._h = h

    this.rpc = wRPC<ClientPanel, ServerPanel>(port)
    this.rpc.listen('mousemoved', (x, y) => this.onMouseMoved(x, y))
    this.rpc.listen('focus', () => this.onFocus())
    this.rpc.listen('mouseentered', () => this.onMouseEntered())
    this.rpc.listen('mouseexited', () => this.onMouseExited())
    this.rpc.listen('mousedown', (b) => this.onMouseDown(b))
    this.rpc.listen('mouseup', () => this.onMouseUp())
    this.rpc.listen('blur', () => this.onBlur())
  }

  override move(x: number, y: number) {
    this.x = x
    this.y = y
    this.fixMouse()
    this.rpc.send('adjust', [this.id, this.x, this.y, this.w, this.h])
  }

  override resize(w: number, h: number) {
    this.w = w
    this.h = h
    this.rpc.send('adjust', [this.id, this.x, this.y, this.w, this.h])
    this.blit()
  }

  blit() {
    const canvas = new OffscreenCanvas(this.w, this.h)
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = ({
      '/apps/desktop.js': '#333',
      '/apps/prog1.js': '#300',
      '/apps/prog2.js': '#030',
      '/apps/prog3.js': '#003',
    })[location.pathname]!

    ctx.fillRect(0, 0, this.w, this.h)
    const bmp = canvas.transferToImageBitmap()
    this.rpc.send('blit', [this.id, bmp], [bmp])
  }

  onMouseEntered() {
  }

  onMouseExited() {
  }

  onMouseDown(b: number) {
    this.down = dragMove(this.absmouse, this)
  }

  onMouseMoved(x: number, y: number) {
    this.absmouse.x = x
    this.absmouse.y = y
    this.fixMouse()
    this.down?.()
  }

  onMouseUp() {
    delete this.down
  }

  onFocus() {

  }

  onBlur() {

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
