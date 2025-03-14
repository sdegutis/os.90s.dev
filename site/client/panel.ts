import { wRPC, type FromPanel, type ToPanel, type ToProg, type ToSys } from "../shared/rpc.js"

type Rpc = ReturnType<typeof wRPC<ToProg, ToSys>>

type MousePos = { x: number, y: number }

export class Panel {

  static map = new Map<number, Panel>()

  rpc
  id

  private _x = 0;
  get x() { return this._x }
  set x(n: number) {
    if (this._x !== n) this.move(this._x = n, this.y)
  }

  private _y = 0;
  get y() { return this._y }
  set y(n: number) {
    if (this._y !== n) this.move(this.x, this._y = n)
  }

  private _w = 0;
  get w() { return this._w }
  set w(n: number) {
    if (this._w !== n) this.resize(this._w = n, this.h)
  }

  private _h = 0;
  get h() { return this._h }
  set h(n: number) {
    if (this._h !== n) this.resize(this.w, this._h = n)
  }

  absmouse: MousePos = { x: 0, y: 0 }
  mouse: MousePos = { x: 0, y: 0 }
  down?: () => void

  constructor(rpc: Rpc, port: MessagePort, id: number, x: number, y: number, w: number, h: number) {
    Panel.map.set(id, this)

    const rpc2 = wRPC<FromPanel, ToPanel>(port)

    rpc2.listen('mousemoved', (x, y) => {
      Panel.map.get(id)?.onMouseMoved(x, y)
    })

    this.rpc = rpc
    this.id = id
    this._x = x
    this._y = y
    this._w = w
    this._h = h
  }

  move(x: number, y: number) {
    this.x = x
    this.y = y
    this.rpc.send('adjpanel', [this.id, this.x, this.y, this.w, this.h])
  }

  resize(w: number, h: number) {
    this.w = w
    this.h = h
    this.rpc.send('adjpanel', [this.id, this.x, this.y, this.w, this.h])
    this.blit()
  }

  blit() {
    const canvas = new OffscreenCanvas(this.w, this.h)
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = ({
      '/apps/desktop.js': '#333',
      '/apps/prog1.js': '#900',
      '/apps/prog2.js': '#090',
      '/apps/prog3.js': '#009',
    })[location.pathname]!

    ctx.fillRect(0, 0, this.w, this.h)
    const bmp = canvas.transferToImageBitmap()
    this.rpc.send('blitpanel', [this.id, bmp], [bmp])
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

    this.mouse.x = x - this.x
    this.mouse.y = y - this.y
    this.down?.()
  }

  onMouseUp() {
    delete this.down
  }

  onFocus() {

  }

  onBlur() {

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
